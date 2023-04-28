---
sidebar_label: gNFT (ERC-4907)
sidebar_position: 5
---

# Gear Dynamic Non-Fungible Token

### Introduction
This is an extension of standard [Non-Fungible token](./gnft-721). It proposes an additional dynamic part that can change or evolve over time. The source code of the Gear NFT smart contract example is available on [GitHub](https://github.com/gear-dapps/dynamic-nft).

### Motivation

Unlike traditional NFTs that represent a static digital asset, dynamic NFTs can have various attributes, properties, or behaviors that can be modified based on certain conditions or user interactions. These changes can be triggered by external factors such as market demand, user preferences, or even real-world events. For example, a dynamic NFT representing a digital artwork may change its appearance or color scheme based on the time of day or weather conditions. 

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

## Conclusion

Gear provides a reusable [library](https://github.com/gear-dapps/gear-lib/tree/master/lib/src/non_fungible_token) with core functionality for the gNFT-4907 protocol. By using object composition, the library can be utilized within a custom NFT contract implementation in order to minimize duplication of community available code.

A source code of the Gear NFT smart contract example based on `gear-lib` is available on GitHub: [gear-dapps/non-fungible-token](https://github.com/gear-dapps/dynamic-nft).

See also an example of the smart contract testing implementation based on `gtest`: [gear-dapps/non-fungible-token/tests](https://github.com/gear-dapps/dynamic-nft/tree/master/tests).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
