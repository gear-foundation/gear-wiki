---
sidebar_label: OnChain NFT
sidebar_position: 17
---

# On-chain gNFT assets

## Introduction

This NFT smart-contract example demonstrates an approach when the token assets are stored directly on chain. For details related to common gNFT smart-contract implentation, read: [gNFT-721](https://wiki.gear-tech.io/examples/gnft-721).

When the owner of a given token ID wishes to transfer it to another user, it is easy to verify ownership and reassign the token to a new owner. Mostly NFTs images (or other base resources) are stored somewhere else (e.g. IPFS) and only the metadata is stored in the contract. Metadata consists of a name, an ID and links to the external resources, where the images are actually stored.

But there is another approach introduced here. Sometimes you can store NFTs directly on chain without any external storage. This approach helps you not to lose your NFT if there is a problem with the external storage.

This article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. The source code is available on [GitHub](https://github.com/gear-dapps/non-fungible-token/tree/master/on-chain-nft).

## Approach
To successfully implement this approach several things are needed. Firstly, when initializing a collection, one should provide all the possible images of all the layers for a collection. Secondly, when minting alongside with a small metadata, one should provide a combination of layers used for a specific NFT. This approach seems quite costly when initializing, but is relatively cheap when it comes to minting.

## Developing on-chain non-fungible-token contract
The functions that must be supported by each non-fungible-token contract:
- *transfer(to, token_id)* - is a function that allows you to transfer a token with the *token_id* number to the *to* account;
- *approve(approved_account, token_id)* - is a function that allows you to give the right to dispose of the token to the specified *approved_account*. This functionality can be useful on marketplaces or auctions as when the owner wants to sell his token, they can put it on a marketplace/auction, so the contract will be able to send this token to the new owner at some point;
- *mint(to, token_id, metadata)* is a function that creates a new token. Metadata can include any information about the token: it can be a link to a specific resource, a description of the token, etc;
- *burn(from, token_id)* is a function that removes the token with the mentioned *token_id* from the contract.

The default implementation of the NFT contract is provided in the gear library: [gear-lib/non_fungible_token](https://github.com/gear-dapps/gear-lib/tree/master/src/non_fungible_token).

To use the default implementation you should include the packages into your *Cargo.toml* file:

```toml
gear-lib = { git = "https://github.com/gear-dapps/gear-lib.git" }
gear-lib-derive = { git = "https://github.com/gear-dapps/gear-lib.git" }
```

First, we start by modifying the state and the init message:

```rust
#[derive(Debug, Default, NFTStateKeeper, NFTCore, NFTMetaState)]
pub struct OnChainNFT {
    #[NFTStateField]
    pub token: NFTState,
    pub token_id: TokenId,
    pub owner: ActorId,
    pub base_image: String,
    pub layers: BTreeMap<LayerId, Vec<String>>,
    pub nfts: BTreeMap<TokenId, Vec<ItemId>>,
    pub nfts_existence: BTreeSet<String>,
}
```

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct InitOnChainNFT {
    pub name: String,
    pub symbol: String,
    pub base_uri: String,
    pub base_image: String,
    pub layers: BTreeMap<LayerId, Vec<String>>,
    pub royalties: Option<Royalties>,
}
```

Next let's rewrite several functions: `mint`, `burn` and `token_uri`. Our `mint` and `burn` functions will behave as one woud expect them to with the addition of slight state modification (e.g. checking against the state, adding/removing). `token_uri` will return an NFT's metadata as well as all the layer content provided for a specified NFT:
```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum OnChainNFTQuery {
    TokenURI { token_id: TokenId },
    Base(NFTQuery),
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum OnChainNFTAction {
    Mint {
        token_metadata: TokenMetadata,
        description: Vec<ItemId>,
    },
    Burn {
        token_id: TokenId,
    },
    Transfer {
        to: ActorId,
        token_id: TokenId,
    },
    Approve {
        to: ActorId,
        token_id: TokenId,
    },
    TransferPayout {
        to: ActorId,
        token_id: TokenId,
        amount: u128,
    },
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct TokenURI {
    pub metadata: TokenMetadata,
    pub content: Vec<String>,
}
```


The `TokenMetadata` is also defined in the gear NFT library:

```rust
#[derive(Debug, Default, Encode, Decode, Clone, TypeInfo)]
pub struct TokenMetadata {
    // ex. "CryptoKitty #100"
    pub name: String,
    // free-form description
    pub description: String,
    // URL to associated media, preferably to decentralized, content-addressed storage
    pub media: String,
    // URL to an off-chain JSON file with more info.
    pub reference: String,
}
```
Define a trait for our new functions that will extend the default `NFTCore` trait:
```rust
pub trait OnChainNFTCore: NFTCore {
    fn mint(&mut self, description: Vec<ItemId>, metadata: TokenMetadata);
    fn burn(&mut self, token_id: TokenId);
    fn token_uri(&mut self, token_id: TokenId) -> Option<Vec<u8>>;
}
```
and write the implementation of that trait:
```rust
impl OnChainNFTCore for OnChainNFT {

    /// Mint an NFT on chain.
    /// `description` - is the vector of ids ,
    ///  where each index represents a layer id, and element represents a layer item id.
    /// `metadata` - is the default metadata provided by gear-lib.
    fn mint(&mut self, description: Vec<ItemId>, metadata: TokenMetadata) {
        // precheck if the layers actually exist
        for (layer_id, layer_item_id) in description.iter().enumerate() {
            if layer_id > self.layers.len() {
                panic!("No such layer");
            }
            if *layer_item_id > self.layers.get(&(layer_id as u128)).expect("No such layer").len() as u128 {
                panic!("No such item");
            }
        }

        // also check if description has all layers provided
        if description.len() != self.layers.len() {
            panic!("The number of layers must be equal to the number of layers in the contract");
        }

        // precheck if there is already an nft with such description
        let key = description
            .clone()
            .into_iter()
            .map(|i| i.to_string())
            .collect::<String>();
        if self.nfts_existence.contains(&key) {
            panic!("Such nft already exists");
        }
        self.nfts_existence.insert(key);
        NFTCore::mint(self, &msg::source(), self.token_id, Some(metadata));
        self.nfts.insert(self.token_id, description);
        self.token_id = self.token_id.saturating_add(U256::one());
    }

    /// Burns an NFT.
    /// `token_id` - is the id of a token. MUST exist.
    fn burn(&mut self, token_id: TokenId) {
        NFTCore::burn(self, token_id);
        let key = self
            .nfts
            .get(&token_id)
            .expect("No such token")
            .iter()
            .map(|i| i.to_string())
            .collect::<String>();
        self.nfts.remove(&token_id);
        self.nfts_existence.remove(&key);
    }

    /// Returns token information - metadata and all the content of all the layers for the NFT.
    /// `token_id` - is the id of a token. MUST exist.
    fn token_uri(&mut self, token_id: TokenId) -> Option<Vec<u8>> {
        let mut metadata = TokenMetadata::default();
        if let Some(Some(mtd)) = self.token.token_metadata_by_id.get(&token_id) {
            metadata = mtd.clone();
        }
        // construct media
        let mut content: Vec<String> = Vec::new();
        // check if exists
        let nft = self.nfts.get(&token_id).expect("No such nft");
        for (layer_id, layer_item_id) in nft.iter().enumerate() {
            let layer_content = self
                .layers
                .get(&(layer_id as u128))
                .expect("No such layer")
                .iter()
                .nth(*layer_item_id as usize)
                .expect("No such layer item");
            content.push(layer_content.clone());
        }
        Some(TokenURI { metadata, content }.encode())
    }
}
```
Accordingly, it is necessary to make changes to the `handle` and `meta_state` functions:
```rust
#[no_mangle]
extern "C" fn handle() {
    let action: OnChainNFTAction = msg::load().expect("Could not load OnChainNFTAction");
    let nft = unsafe { CONTRACT.get_or_insert(Default::default()) };
    match action {
        OnChainNFTAction::Mint {
            description,
            token_metadata,
        } => OnChainNFTCore::mint(nft, description, token_metadata),
        OnChainNFTAction::Burn { token_id } => OnChainNFTCore::burn(nft, token_id),
        OnChainNFTAction::Transfer { to, token_id } => NFTCore::transfer(nft, &to, token_id),
        OnChainNFTAction::TransferPayout {
            to,
            token_id,
            amount,
        } => NFTCore::transfer_payout(nft, &to, token_id, amount),
        OnChainNFTAction::Approve { to, token_id } => NFTCore::approve(nft, &to, token_id),
    }
}

#[no_mangle]
extern "C" fn meta_state() -> *mut [i32; 2] {
    let query: OnChainNFTQuery = msg::load().expect("failed to decode input argument");
    let nft = unsafe { CONTRACT.get_or_insert(Default::default()) };
    match query {
        OnChainNFTQuery::TokenURI { token_id } => {
            let encoded = OnChainNFTCore::token_uri(nft, token_id)
                .expect("Error in reading OnChainNFT contract state");
            gstd::util::to_leak_ptr(encoded)
        }
        OnChainNFTQuery::Base(query) => {
            let encoded =
                NFTMetaState::proc_state(nft, query).expect("Error in reading NFT contract state");
            gstd::util::to_leak_ptr(encoded)
        }
    }
}
```

## Conclusion

Gear provides a reusable [library](https://github.com/gear-dapps/non-fungible-token/tree/master/nft/src) with core functionality for the gNFT protocol. By using object composition, that library can be utilized within a custom NFT contract implementation in order to minimize duplication of community available code.

A source code of the on-chain NFT provided by Gear is available on GitHub: [on-chain-nft/src](https://github.com/gear-dapps/non-fungible-token/tree/master/on-chain-nft/src).

See also an example of the smart contract testing implementation based on `gtest`: [on-chain-nft/tests](https://github.com/gear-dapps/non-fungible-token/tree/master/on-chain-nft/tests).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
