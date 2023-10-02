---
sidebar_label: OnChain NFT
sidebar_position: 17
---

# On-chain gNFT assets

## Introduction

This NFT smart-contract example demonstrates an approach when the token assets are stored directly on chain. For details related to common gNFT smart-contract implentation, read: [gNFT-721](gnft-721).

When the owner of a given token ID wishes to transfer it to another user, it is easy to verify ownership and reassign the token to a new owner. Mostly NFTs images (or other base resources) are stored somewhere else (e.g. IPFS) and only the metadata is stored in the contract. Metadata consists of a name, an ID and links to the external resources, where the images are actually stored.

But there is another approach introduced here. Sometimes you can store NFTs directly on chain without any external storage. This approach helps you not to lose your NFT if there is a problem with the external storage.

This article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. The source code is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/on-chain-nft).

## Approach
To successfully implement this approach several things are needed. Firstly, when initializing a collection, one should provide all the possible images of all the layers for a collection. Secondly, when minting alongside with a small metadata, one should provide a combination of layers used for a specific NFT. This approach seems quite costly when initializing, but is relatively cheap when it comes to minting.

## Developing on-chain non-fungible-token contract
The functions that must be supported by each non-fungible-token contract:
- *transfer(to, token_id)* - is a function that allows you to transfer a token with the *token_id* number to the *to* account;
- *approve(approved_account, token_id)* - is a function that allows you to give the right to dispose of the token to the specified *approved_account*. This functionality can be useful on marketplaces or auctions as when the owner wants to sell his token, they can put it on a marketplace/auction, so the contract will be able to send this token to the new owner at some point;
- *mint(to, token_id, metadata)* is a function that creates a new token. Metadata can include any information about the token: it can be a link to a specific resource, a description of the token, etc;
- *burn(from, token_id)* is a function that removes the token with the mentioned *token_id* from the contract.

The default implementation of the NFT contract is provided in the gear library: [gear-lib/non_fungible_token](https://github.com/gear-foundation/dapps/tree/master/contracts/gear-lib/src/tokens).

To use the default implementation you should include the packages into your *Cargo.toml* file:

```toml
gear-lib = { git = "https://github.com/gear-foundation/dapps", tag = "0.3.3" }
```

First, we start by modifying the state and the init message:

```rust title="on-chain-nft/src/lib.rs"
#[derive(Debug, Default, NFTStateKeeper, NFTCore, NFTMetaState)]
pub struct OnChainNFT {
    #[NFTStateField]
    pub token: NFTState,
    pub token_id: TokenId,
    pub owner: ActorId,
    pub base_image: String,
    pub layers: HashMap<LayerId, Vec<String>>,
    pub nfts: HashMap<TokenId, Vec<ItemId>>,
    pub nfts_existence: HashSet<String>,
}
```

```rust title="on-chain-nft/io/src/lib.rs"
/// Initializes on-chain NFT
/// Requirements:
/// * all fields except `royalties` should be specified
#[derive(Debug, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct InitOnChainNFT {
    /// NFT name
    pub name: String,
    /// NFT symbol
    pub symbol: String,
    /// NFT base_uri (not applicable in on-chain)
    pub base_uri: String,
    /// Base Image is base64encoded svg.
    /// Provides a base layer for all future nfts.
    pub base_image: String,
    /// Layers map - mapping of layerid the list of layer items.
    /// Each layer item is a base64encoded svg.
    pub layers: Vec<(LayerId, Vec<String>)>,
    /// Royalties for NFT
    pub royalties: Option<Royalties>,
}
```

Next let's rewrite several functions: `mint`, `burn` and `token_uri`. Our `mint` and `burn` functions will behave as one woud expect them to with the addition of slight state modification (e.g. checking against the state, adding/removing). `token_uri` will return an NFT's metadata as well as all the layer content provided for a specified NFT:
```rust title="on-chain-nft/io/src/lib.rs"
#[derive(Debug, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum OnChainNFTQuery {
    /// Returns an NFT for a specified `token_id`.
    ///
    /// Requirements:
    /// * `token_id` MUST exist
    ///
    /// Arguments:
    /// * `token_id` - is the id of the NFT
    ///
    /// On success, returns TokenURI struct.
    TokenURI { token_id: TokenId },
    /// Base NFT query. Derived from gear-lib.
    Base(NFTQuery),
}

#[derive(Debug, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum OnChainNFTAction {
    /// Mints an NFT consisting of layers provided in the `description` parameter.
    ///
    /// Requirements:
    /// * `description` MUST contain layers and layers' items that EXIST
    ///
    /// Arguments:
    /// * `token_metadata` - is a default token metadata from gear-lib.
    /// * `description` - is the vector of layer's item id, where
    /// the index i is the layer id.
    ///
    /// On success, returns NFTEvent::Mint from gear-lib.
    Mint {
        /// Metadata
        token_metadata: TokenMetadata,
        /// Layers description of an NFT
        description: Vec<ItemId>,
    },
    /// Burns an NFT.
    ///
    /// Requirements:
    /// * `token_id` MUST exist
    /// Arguments:
    ///
    /// * `token_id` - is the id of the burnt token
    ///
    /// On success, returns NFTEvent::Burn from gear-lib.
    Burn {
        /// Token id to burn.
        token_id: TokenId,
    },
    /// Transfers an NFT.
    ///
    /// Requirements:
    /// * `token_id` MUST exist
    /// * `to` MUST be a non-zero addresss
    ///
    /// Arguments:
    /// * `token_id` - is the id of the transferred token
    ///
    /// On success, returns NFTEvent::Transfer from gear-lib.
    Transfer {
        /// A recipient address.
        to: ActorId,
        /// Token id to transfer.
        token_id: TokenId,
    },
    /// Approves an account to perform operation upon the specifiefd NFT.
    ///
    /// Requirements:
    /// * `token_id` MUST exist
    /// * `to` MUST be a non-zero addresss
    ///
    /// Arguments:
    /// * `token_id` - is the id of the transferred token
    ///
    /// On success, returns NFTEvent::Approval from gear-lib.
    Approve {
        /// An account being approved.
        to: ActorId,
        /// Token id approved for the account.
        token_id: TokenId,
    },
    /// Transfers payouts from an NFT to an account.
    ///
    /// Requirements:
    /// * `token_id` MUST exist
    /// * `to` MUST be a non-zero addresss
    /// * `amount` MUST be a non-zero number
    ///
    /// Arguments:
    /// * `token_id` - is the id of the transferred token
    ///
    /// On success, returns NFTEvent::Approval from gear-lib.
    TransferPayout {
        /// Payout recipient
        to: ActorId,
        /// Token id to get the payout from.
        token_id: TokenId,
        /// Payout amount.
        amount: u128,
    },
}

#[derive(Debug, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct TokenURI {
    /// Token metadata derived from gear-lib
    pub metadata: TokenMetadata,
    /// List of base64encoded svgs representing different layers of an NFT.
    pub content: Vec<String>,
}
```


The `TokenMetadata` is also defined in the gear NFT library:

```rust title="gear-lib-old/src/non_fungible_token/token.rs" 
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
```rust title="on-chain-nft/src/lib.rs"
pub trait OnChainNFTCore: NFTCore {
    fn mint(&mut self, description: Vec<ItemId>, metadata: TokenMetadata) -> NFTTransfer;
    fn burn(&mut self, token_id: TokenId) -> NFTTransfer;
    fn token_uri(&mut self, token_id: TokenId) -> Option<Vec<u8>>;
}
```
and write the implementation of that trait:
```rust title="on-chain-nft/src/lib.rs"
impl OnChainNFTCore for OnChainNFT {
    /// Mint an NFT on chain.
    /// `description` - is the vector of ids ,
    ///  where each index represents a layer id, and element represents a layer item id.
    /// `metadata` - is the default metadata provided by gear-lib.
    fn mint(&mut self, description: Vec<ItemId>, metadata: TokenMetadata) -> NFTTransfer {
        // precheck if the layers actually exist
        for (layer_id, layer_item_id) in description.iter().enumerate() {
            if layer_id > self.layers.len() {
                panic!("No such layer");
            }
            if *layer_item_id
                > self
                    .layers
                    .get(&(layer_id as u128))
                    .expect("No such layer")
                    .len() as u128
            {
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
        let transfer = NFTCore::mint(self, &msg::source(), self.token_id, Some(metadata));
        self.nfts.insert(self.token_id, description);
        self.token_id = self.token_id.saturating_add(U256::one());
        transfer
    }

    /// Burns an NFT.
    /// `token_id` - is the id of a token. MUST exist.
    fn burn(&mut self, token_id: TokenId) -> NFTTransfer {
        let transfer = NFTCore::burn(self, token_id);
        let key = self
            .nfts
            .get(&token_id)
            .expect("No such token")
            .iter()
            .map(|i| i.to_string())
            .collect::<String>();
        self.nfts.remove(&token_id);
        self.nfts_existence.remove(&key);
        transfer
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
```rust title="on-chain-nft/src/lib.rs"
#[no_mangle]
extern fn handle() {
    let action: OnChainNFTAction = msg::load().expect("Could not load OnChainNFTAction");
    let nft = unsafe { CONTRACT.get_or_insert(Default::default()) };
    match action {
        OnChainNFTAction::Mint {
            description,
            token_metadata,
        } => msg::reply(
            OnChainNFTEvent::Transfer(OnChainNFTCore::mint(nft, description, token_metadata)),
            0,
        ),
        OnChainNFTAction::Burn { token_id } => msg::reply(
            OnChainNFTEvent::Transfer(OnChainNFTCore::burn(nft, token_id)),
            0,
        ),
        OnChainNFTAction::Transfer { to, token_id } => msg::reply(
            OnChainNFTEvent::Transfer(NFTCore::transfer(nft, &to, token_id)),
            0,
        ),
        OnChainNFTAction::TransferPayout {
            to,
            token_id,
            amount,
        } => msg::reply(
            OnChainNFTEvent::TransferPayout(NFTCore::transfer_payout(nft, &to, token_id, amount)),
            0,
        ),
        OnChainNFTAction::Approve { to, token_id } => msg::reply(
            OnChainNFTEvent::Approval(NFTCore::approve(nft, &to, token_id)),
            0,
        ),
    }
    .expect("Error during replying with `OnChainNFTEvent`");
}

```

### Programm metadata and state
Metadata interface description:

```rust title="on-chain-nft/io/src/lib.rs"
pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = In<InitOnChainNFT>;
    type Handle = InOut<OnChainNFTAction, OnChainNFTEvent>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Out<State>;
}
```
To display the full contract state information, the `state()` function is used:

```rust title="on-chain-nft/src/lib.rs"
#[no_mangle]
extern fn state() {
    let contract = unsafe { CONTRACT.take().expect("Unexpected error in taking state") };
    msg::reply::<State>(contract.into(), 0)
        .expect("Failed to encode or reply with `State` from `state()`");
}
```
To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `State` state. For example - [gear-foundation/dapps/on-chain-nft/state](https://github.com/gear-foundation/dapps/tree/master/contracts/on-chain-nft/state):

```rust title="on-chain-nft/state/src/lib.rs"
#[gmeta::metawasm]
pub mod metafns {
    pub type State = on_chain_nft_io::State;

    pub fn token_uri(state: State, token_id: TokenId) -> Option<Vec<u8>> {
        let metadata = state
            .token
            .token_metadata_by_id
            .iter()
            .find(|(id, _)| token_id.eq(id))
            .and_then(|(_id, metadata)| metadata.clone())
            .unwrap_or_default();
        // construct media
        let mut content: Vec<String> = Vec::new();
        // check if exists

        if let Some((_id, nft)) = state.nfts.iter().find(|(id, _)| token_id.eq(id)) {
            for (i, layer_item_id) in nft.iter().enumerate() {
                if let Some((_id, layer_content)) =
                    state.layers.iter().find(|(id, _)| (i as u128).eq(id))
                {
                    let s = layer_content
                        .get(*layer_item_id as usize)
                        .expect("No such layer item");
                    content.push(s.clone());
                }
            }
        }

        Some(TokenURI { metadata, content }.encode())
    }

    pub fn base(state: State, query: NFTQuery) -> Option<Vec<u8>> {
        let encoded = match query {
            NFTQuery::NFTInfo => NFTQueryReply::NFTInfo {
                name: state.token.name.clone(),
                symbol: state.token.symbol.clone(),
                base_uri: state.token.base_uri,
            },
            NFTQuery::Token { token_id } => NFTQueryReply::Token {
                token: state.token.token(token_id),
            },
            NFTQuery::TokensForOwner { owner } => NFTQueryReply::TokensForOwner {
                tokens: state.token.tokens_for_owner(&owner),
            },
            NFTQuery::TotalSupply => NFTQueryReply::TotalSupply {
                total_supply: state.token.total_supply(),
            },
            NFTQuery::SupplyForOwner { owner } => NFTQueryReply::SupplyForOwner {
                supply: state.token.supply_for_owner(&owner),
            },
            NFTQuery::AllTokens => NFTQueryReply::AllTokens {
                tokens: state.token.all_tokens(),
            },
            NFTQuery::ApprovedTokens { account } => NFTQueryReply::ApprovedTokens {
                tokens: state.token.approved_tokens(&account),
            },
        }
        .encode();
        Some(encoded)
    }
}
```

## Conclusion

Gear provides a reusable [library](https://github.com/gear-foundation/dapps/tree/master/contracts/gear-lib/src) with core functionality for the gNFT protocol. By using object composition, that library can be utilized within a custom NFT contract implementation in order to minimize duplication of community available code.

A source code of the on-chain NFT example is available on GitHub: [on-chain-nft](https://github.com/gear-foundation/dapps/tree/master/contracts/on-chain-nft).

See also an example of the smart contract testing implementation based on `gtest`: [on-chain-nft/tests](https://github.com/gear-foundation/dapps/tree/master/contracts/on-chain-nft/tests).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
