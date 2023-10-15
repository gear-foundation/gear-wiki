---
sidebar_label: Dynamic NFT
sidebar_position: 3
---

# Gear Dynamic Non-Fungible Token

### Introduction
This is an extension of standard [Non-Fungible token](../Standards/gnft-721). It proposes an additional dynamic part that can change or evolve over time. The source code of the Gear NFT smart contract example is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/dynamic-nft).

### Motivation

Unlike traditional NFTs that represent a static digital asset, dynamic NFTs can have various attributes, properties, or behaviors that can be modified based on certain conditions or user interactions. These changes can be triggered by external factors such as market demand, user preferences, or even real-world events. For example, a dynamic NFT representing a digital artwork may change its appearance or color scheme based on the time of day or weather conditions.

This example demonstrates Gear Protocol's unique features enabling the new user experience for totally on-chain, truly decentralized applications that do not require centralized components. [Delayed messages](/developing-contracts/delayed-messages.md) allows the contract to wake itself after a specified period of time. It is acheived via [gas reservation](/developing-contracts/gas-reservation.md) feature, which allows for the creation of gas pools that can be used by programs for further execution.

### Details

The default implementation of the NFT contract is provided in the Gear library: [/gear-lib/src/tokens/non_fungible.rs](https://github.com/gear-foundation/dapps/blob/master/contracts/gear-lib/src/tokens/non_fungible.rs).

To use the default implementation you should include the packages into your *Cargo.toml* file:

```toml
gear-lib = { git = "https://github.com/gear-foundation/dapps.git" }
gear-lib-derive = { git = "https://github.com/gear-foundation/dapps.git" }
```

Dynamic NFT contains regular NFT (../Standards/gnft-721) and additional field  `dynamic_data`:

```rust title="dynamic-nft/src/lib.rs"
#[derive(Debug, Default, NFTStateKeeper, NFTCore, NFTMetaState)]
pub struct DynamicNft {
    #[NFTStateField]
    pub token: NFTState,
    pub token_id: TokenId,
    pub owner: ActorId,
    pub transactions: HashMap<H256, NFTEvent>,
    pub collection: Collection,
    pub config: Config,
    pub dynamic_data: Vec<u8>,
}
```
In all other cases, everything also corresponds to the usual [non-fungible-token](../Standards/gnft-721) contract, except additional specific actions:

```rust title="dynamic-nft/io/src/lib.rs"
pub enum NFTAction {
    // ... like a usual NFT contract
    UpdateDynamicData {
        transaction_id: u64,
        data: Vec<u8>,
    },
}
```
And features specific events:

```rust title="dynamic-nft/io/src/lib.rs"
pub enum NFTEvent {
    // ... like a usual NFT contract
    Updated {
        data_hash: H256,
    },
}
```

## Examples

For an example, look at this [Auto-changed NFT](https://github.com/gear-foundation/dapps/tree/master/contracts/auto-changed-nft) contract. This is a modified dynamic contract in which own dynamic data changes over time periods. We slightly changed the logic of the dynamic NFT contract to suit our needs.

First, let's change the contract name and add new fields:
`rest_updates_count` - number of periodic updates. 
`update_period` - interval between automatic updates.

```rust title="auto-changed-nft/src/lib.rs"
pub struct AutoChangedNft {
    #[NFTStateField]
    pub token: NFTState,
    pub token_id: TokenId,
    pub owner: ActorId,
    pub transactions: HashMap<H256, NFTEvent>,
    pub collection: Collection,
    pub config: Config,
    pub urls: HashMap<TokenId, Vec<String>>,
    pub rest_updates_count: u32,
    pub update_period: u32,
}
```

Next we will change the `handle()` function, we will add the business logic we need there:

```rust title="auto-changed-nft/src/lib.rs"
#[no_mangle]
unsafe extern fn handle() {
    /// ...
    NFTAction::Update {
        rest_updates_count,
        token_ids,
    } => {
        gstd::debug!(
            "Update rest_updates_count: {}, token_ids: {:?}",
            rest_updates_count,
            token_ids
        );
        nft.rest_updates_count = rest_updates_count - 1;
        nft.update_media(&token_ids);
        if nft.rest_updates_count == 0 {
            return;
        }
        let action = NFTAction::Update {
            rest_updates_count: nft.rest_updates_count,
            token_ids,
        };
        let gas_available = exec::gas_available();
        gstd::debug!("Update. gas_available: {}", gas_available);
        if gas_available <= GAS_FOR_UPDATE {
            let reservations = unsafe { &mut RESERVATION };
            let reservation_id = reservations.pop().expect("Need more gas");
            send_delayed_from_reservation(
                reservation_id,
                exec::program_id(),
                action,
                0,
                nft.update_period,
            )
            .expect("Can't send delayed from reservation");
        } else {
            send_delayed(exec::program_id(), action, 0, nft.update_period)
                .expect("Can't send delayed");
        }
    }
    NFTAction::StartAutoChanging {
        updates_count,
        update_period,
        token_ids,
    } => {
        nft.rest_updates_count = updates_count;
        nft.update_period = update_period;

        nft.update_media(&token_ids);

        let payload = NFTAction::Update {
            rest_updates_count: updates_count,
            token_ids: token_ids.clone(),
        };
        let message_id = send_delayed(exec::program_id(), &payload, 0, update_period)
            .expect("Can't send delayed");
        nft.reserve_gas();
        gstd::debug!(
            "send_delayed payload: message_id: {:?}, {:?}, update_period: {} token_ids: {:?}",
            message_id,
            payload,
            update_period,
            token_ids
        );
    }
};

```

All is ready. Then there was a need to check that it works in tests:
```rust title="auto-changed-nft/tests/nft_tests.rs"
#[test]
fn auto_change_success() {
    let sys = System::new();
    init_nft(&sys);
    let nft = sys.get_program(1);
    let transaction_id: u64 = 0;
    assert!(!mint(&nft, transaction_id, USERS[0]).main_failed());

    let link1 = "link 1";
    let link2 = "link 2";
    let link3 = "link 3";
    let link4 = "link 4";

    let token_id = TokenId::default();
    assert!(!add_url(&nft, token_id, link1, USERS[0]).main_failed());
    assert!(!add_url(&nft, token_id, link2, USERS[0]).main_failed());
    assert!(!add_url(&nft, token_id, link3, USERS[0]).main_failed());
    assert!(!add_url(&nft, token_id, link4, USERS[0]).main_failed());

    let updates_count = 8;
    let updates_period = 5;
    assert!(!start_auto_changing(
        &nft,
        vec![token_id],
        updates_count,
        updates_period,
        USERS[0]
    )
    .main_failed());

    // Start update
    assert_eq!(current_media(&nft, token_id), link1);

    sys.spend_blocks(updates_period);
    assert_eq!(current_media(&nft, token_id), link4);

    sys.spend_blocks(updates_period);
    assert_eq!(current_media(&nft, token_id), link3);

    sys.spend_blocks(updates_period);
    assert_eq!(current_media(&nft, token_id), link2);

    // Media rotation happens
    sys.spend_blocks(updates_period);
    assert_eq!(current_media(&nft, token_id), link1);

    sys.spend_blocks(updates_period);
    assert_eq!(current_media(&nft, token_id), link4);

    sys.spend_blocks(updates_period);
    assert_eq!(current_media(&nft, token_id), link3);

    sys.spend_blocks(updates_period);
    assert_eq!(current_media(&nft, token_id), link2);
}
```

Similarly, you can implement other logic, for example, periodically request data from the Oracle.

## Conclusion

Gear provides a reusable [library](https://github.com/gear-foundation/dapps/blob/master/contracts/gear-lib/src/tokens/non_fungible.rs) with core functionality for the `gNFT-4907` protocol. By using object composition, the library can be utilized within a custom NFT contract implementation in order to minimize duplication of community available code.

A source code of the Gear NFT smart contract example based on `gear-lib` is available on GitHub: [gear-foundation/dapps/non-fungible-token](https://github.com/gear-foundation/dapps/tree/master/contracts/dynamic-nft).

See also an example of the smart contract testing implementation based on `gtest`: [gear-foundation/dapps/non-fungible-token/tests](https://github.com/gear-foundation/dapps/tree/master/contracts/dynamic-nft/tests).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
