---
sidebar_label: gNFT (ERC-4907)
sidebar_position: 5
---

# Gear Dynamic Non-Fungible Token

### Introduction
This is an extension of standard [Non-Fungible token](./gnft-721). It proposes an additional dynamic part that can change or evolve over time. The source code of the Gear NFT smart contract example is available on [GitHub](https://github.com/gear-dapps/dynamic-nft).

### Motivation

Unlike traditional NFTs that represent a static digital asset, dynamic NFTs can have various attributes, properties, or behaviors that can be modified based on certain conditions or user interactions. These changes can be triggered by external factors such as market demand, user preferences, or even real-world events. For example, a dynamic NFT representing a digital artwork may change its appearance or color scheme based on the time of day or weather conditions.

This example demonstrates Gear Protocol's unique features enabling the new user experience for totally on-chain, truly decentralized applications that do not require centralized components. [Delayed messages](/developing-contracts/delayed-messages.md) allows the contract to wake itself after a specified period of time. It is acheived via [gas reservation](/developing-contracts/gas-reservation.md) feature, which allows for the creation of gas pools that can be used by programs for further execution.

### Details

The default implementation of the NFT contract is provided in the gear library: [gear-lib/non_fungible_token](https://github.com/gear-dapps/gear-lib/tree/master/lib/src/non_fungible_token).

To use the default implementation you should include the packages into your *Cargo.toml* file:

```toml
gear-lib = { git = "https://github.com/gear-dapps/gear-lib.git" }
gear-lib-derive = { git = "https://github.com/gear-dapps/gear-lib.git" }
hashbrown = "0.13"
```

Dynamic NFT contains regular NFT (gnft-721) and additional field  `dynamic_data`:

```rust
use hashbrown::HashMap;

#[derive(Debug, Default, NFTStateKeeper, NFTCore, NFTMetaState)]
pub struct DynamicNft {
    #[NFTStateField]
    pub token: NFTState,
    pub token_id: TokenId,
    pub owner: ActorId,
    pub transactions: HashMap<H256, NFTEvent>,
    pub dynamic_data: Vec<u8>,
}
```
In all other cases, everything also corresponds to the usual [non-fungible-token](./gnft-721) contract, except additional specific actions:

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum NFTAction {
    // ... like a usual NFT contract
    UpdateDynamicData {
        transaction_id: u64,
        data: Vec<u8>,
    },
}
```
And features specific events:

```rust
#[derive(Clone, Debug, Encode, Decode, TypeInfo)]
pub enum NFTEvent {
    Updated {
        data_hash: H256,
    },
}
```

## Examples

For an example, look at this [Auto-changed NFT](https://github.com/gear-dapps/auto-changed-nft) contract. This is a modified dynamic contract in which own dynamic data changes over time periods. We slightly changed the logic of the dynamic nft  contract to suit our needs. 

First, let's change the name of the contract and add a new field `rest_update_periods` in which we store the rest update periods (in our example, we need 2 updates):

```Rust
pub struct AutoChangedNft {
    #[NFTStateField]
    pub token: NFTState,
    pub token_id: TokenId,
    pub owner: ActorId,
    pub transactions: HashMap<H256, NFTEvent>,
    pub dynamic_data: Vec<u8>,
    pub rest_update_periods: u32,
}
```

At initializing the contract, we send a deferred message that will change the dynamic data of the contract:

```Rust 
#[no_mangle]
unsafe extern "C" fn init() {
    let config: InitNFT = msg::load().expect("Unable to decode InitNFT");
    if config.royalties.is_some() {
        config.royalties.as_ref().expect("Unable to g").validate();
    }
    let nft = AutoChangedNft {
        token: NFTState {
            name: config.name,
            symbol: config.symbol,
            base_uri: config.base_uri,
            royalties: config.royalties,
            ..Default::default()
        },
        owner: msg::source(),
        rest_update_periods: 2, // for example - two updates
        ..Default::default()
    };

    let periods = nft.rest_update_periods;
    CONTRACT = Some(nft);

    let data = format!("Rest Update Periods: {}", periods)
        .as_bytes()
        .to_vec();

    let payload = NFTAction::UpdateDynamicData {
        transaction_id: 1,
        data,
    };
    msg::send_delayed(exec::program_id(), payload, 0, DELAY).expect("Cant send delayed msg");
}
```

Next we will change the `handle()` function, we will add the business logic we need there:

```Rust
unsafe extern "C" fn handle() {
    /// ...
    NFTAction::UpdateDynamicData {
            transaction_id,
            data,
        } => {
            let payload = nft.process_transaction(transaction_id, |nft| {
                let data_hash = H256::from(sp_core_hashing::blake2_256(&data));
                if nft.rest_update_periods > 0 {
                    nft.dynamic_data = data;
                    nft.rest_update_periods -= 1;
                    let periods = nft.rest_update_periods;
                    let data = format!("Rest Update Periods: {}", periods)
                        .as_bytes()
                        .to_vec();
                    let payload = NFTAction::UpdateDynamicData {
                        transaction_id: transaction_id + 1,
                        data,
                    };
                    msg::send_delayed(exec::program_id(), payload, 0, DELAY)
                        .expect("Can't send delayed");
                } else {
                    nft.dynamic_data = format!("Expired").as_bytes().to_vec();
                }
                NFTEvent::Updated { data_hash }
            });
            msg::reply(payload, 0).expect("Error during replying with `NFTEvent::Updated`");
        }

```

All is ready. Then there was a need to check that it works in tests:
```Rust
#[test]
fn auto_change_success() {
    let sys = System::new();
    init_nft(&sys);
    let nft = sys.get_program(1);
    let transaction_id: u64 = 0;
    assert!(!mint(&nft, transaction_id, USERS[0]).main_failed());

    let state: IoNFT = nft.read_state().unwrap();
    let expected_dynamic_data: Vec<u8> = vec![];
    assert_eq!(expected_dynamic_data, state.dynamic_data);
    const DELAY: u32 = 5;
    
    sys.spend_blocks(DELAY);
    let state: IoNFT = nft.read_state().unwrap();
    let expected_dynamic_data = format!("Rest Update Periods: 2").as_bytes().to_vec();
    assert_eq!(expected_dynamic_data, state.dynamic_data);

    sys.spend_blocks(DELAY);
    let state: IoNFT = nft.read_state().unwrap();
    let expected_dynamic_data = format!("Rest Update Periods: 1").as_bytes().to_vec();
    assert_eq!(expected_dynamic_data, state.dynamic_data);

    sys.spend_blocks(DELAY);
    let state: IoNFT = nft.read_state().unwrap();
    let expected_dynamic_data = format!("Expired").as_bytes().to_vec();
    assert_eq!(expected_dynamic_data, state.dynamic_data);
}
```

Similarly, you can implement other logic, for example, periodically request data from the Oracle.

## Conclusion

Gear provides a reusable [library](https://github.com/gear-dapps/gear-lib/tree/master/lib/src/non_fungible_token) with core functionality for the gNFT-4907 protocol. By using object composition, the library can be utilized within a custom NFT contract implementation in order to minimize duplication of community available code.

A source code of the Gear NFT smart contract example based on `gear-lib` is available on GitHub: [gear-dapps/non-fungible-token](https://github.com/gear-dapps/dynamic-nft).

See also an example of the smart contract testing implementation based on `gtest`: [gear-dapps/non-fungible-token/tests](https://github.com/gear-dapps/dynamic-nft/tree/master/tests).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
