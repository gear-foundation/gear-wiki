---
sidebar_label: gNFT (ERC-721)
sidebar_position: 2
---

# Gear Non-Fungible Token

![img alt](../img/nft.png)

Non-fungible tokens (NFTs) are unique cryptographic tokens on a blockchain used to prove ownership of digital assets, such as digital art or gaming assets. The difference from fungible tokens is that fungible tokens store value, while non-fungible tokens store a cryptographic certificate.

Under the hood, a non-fungible token consists of a unique token identifier, or token ID, which is mapped to an owner identifier and stored inside an NFT smart contract. <center> <em><strong>token_id</strong></em> → <em><strong>address</strong></em> </center>

When the owner of a given token ID wishes to transfer it to another user, it is easy to verify ownership and reassign the token to a new owner.

This article explains the programming interface, data structure, basic functions, and their purposes. It can be used as-is or modified to suit your scenarios. Anyone can easily create their own application and run it on the Gear-powered network.

## How to run

### ⚒️ Build program

- Get the source code of [NFT contract](https://github.com/gear-foundation/dapps/tree/master/contracts/nft)
- Build contracts as described in [program/README.md](https://github.com/gear-foundation/dapps/blob/master/contracts/nft/README.md).

### 🏗️ Upload program

1. You can deploy a program using [idea.gear-tech.io](https://idea.gear-tech.io/).
2. In the network selector choose `Staging Testnet` or `Development` (in this case, you should have a local node running)
3. Upload program `nft.opt.wasm` from `/target/wasm32-unknown-unknown/release/`
4. Upload metadata file `meta.txt`
5. Specify `init payload` and calculate gas!


### Non-fungible-token implementation
The functions that must be supported by each non-fungible-token contract:

- *transfer(to, token_id)* - is a function that allows you to transfer a token with the `token_id` number to the `to` account;
- *approve(to, token_id)* - is a function that allows you to give the right to dispose of the token to the specified account `to`. This functionality can be useful on marketplaces or auctions as when the owner wants to sell his token, they can put it on a marketplace/auction, so the contract will be able to send this token to the new owner at some point;
- *mint(to, metadata)* is a function that creates a new token to the `to` account. `metadata` can include any information about the token: it can be a link to a specific resource, a description of the token, etc;
- *burn(token_id)* is a function that removes the token with the mentioned `token_id` from the contract.

The non-fungible-token contract contains the following information:

```rust title="nft/src/lib.rs"
pub struct Nft {
    pub owner_by_id: HashMap<TokenId, ActorId>,
    pub token_approvals: HashMap<TokenId, ActorId>,
    pub token_metadata_by_id: HashMap<TokenId, TokenMetadata>,
    pub tokens_for_owner: HashMap<ActorId, HashSet<TokenId>>,
    pub token_id: TokenId,
    pub owner: ActorId,
    pub collection: Collection,
    pub config: Config,
}
```

* `owner_by_id` - token and owner id pair
* `token_approvals` - token id pair and approved owners
* `token_metadata_by_id` - a pair of token id and token metadata
* `tokens_for_owner` - a pair of owner id and the id of all its tokens
* `token_id` - current token id
* `owner` - collection owner 
* `collection` - information about this collection
* `config` - configuration of collection 

Where `TokenMetadata`, `Collection` and `Config` contains the following information: 

```rust title="nft/io/src/lib.rs"
pub struct TokenMetadata {
    pub name: String,
    pub description: String,
    pub media: String,
    pub reference: String,
}
```
```rust title="nft/io/src/lib.rs"
pub struct Collection {
    pub name: String,
    pub description: String,
}
```
```rust title="nft/io/src/lib.rs"
pub struct Config {
    pub max_mint_count: Option<u128>,
}
```

### Initialization
To initialize a contract, it needs to be passed `Config` and `Collection` structures

```rust title="nft/io/src/lib.rs"
pub struct InitNft {
    pub collection: Collection,
    pub config: Config,
}
```

### Action

```rust title="nft/io/src/lib.rs"
pub enum NftAction {
    Mint {
        to: ActorId,
        token_metadata: TokenMetadata,
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
    Owner {
        token_id: TokenId,
    },
    IsApproved {
        to: ActorId,
        token_id: TokenId,
    },
}
```

### Event

```rust title="nft/io/src/lib.rs"
pub enum NftEvent {
    Minted {
        to: ActorId,
        token_metadata: TokenMetadata,
    },
    Burnt {
        token_id: TokenId,
    },
    Transferred {
        from: ActorId,
        to: ActorId,
        token_id: TokenId,
    },
    Approved {
        owner: ActorId,
        approved_account: ActorId,
        token_id: TokenId,
    },
    Owner {
        owner: ActorId,
        token_id: TokenId,
    },
    IsApproved {
        to: ActorId,
        token_id: TokenId,
        approved: bool,
    },
}
```

### Contract implementation

```rust title="nft/src/lib.rs"
#[no_mangle]
unsafe extern fn handle() {
    let action: NftAction = msg::load().expect("Could not load NftAction");
    let nft = NFT.get_or_insert(Default::default());
    let result = match action {
        NftAction::Mint { to, token_metadata } => nft.mint(&to, token_metadata),
        NftAction::Burn { token_id } => nft.burn(token_id),
        NftAction::Transfer { to, token_id } => nft.transfer(&to, token_id),
        NftAction::Approve { to, token_id } => nft.approve(&to, token_id),
        NftAction::Owner { token_id } => nft.owner(token_id),
        NftAction::IsApproved { to, token_id } => nft.is_approved_to(&to, token_id),
    };
    msg::reply(result, 0).expect("Failed to encode or reply with `NftEvent`.");
}
```

```rust title="nft/src/lib.rs"
impl Nft {
    /// Mint a new nft using `TokenMetadata`
    fn mint(&mut self, to: &ActorId, token_metadata: TokenMetadata) -> NftEvent {
        self.check_config();
        self.check_zero_address(to);
        self.owner_by_id.insert(self.token_id, *to);
        self.tokens_for_owner
            .entry(*to)
            .and_modify(|tokens| {
                tokens.insert(self.token_id);
            })
            .or_insert_with(|| {
                let mut set = HashSet::new();
                set.insert(self.token_id);
                set
            });
        self.token_metadata_by_id
            .insert(self.token_id, token_metadata.clone());

        self.token_id += 1;

        NftEvent::Minted {
            to: *to,
            token_metadata,
        }
    }
    /// Burn nft by `TokenId`
    fn burn(&mut self, token_id: TokenId) -> NftEvent {
        let owner = *self
            .owner_by_id
            .get(&token_id)
            .expect("NonFungibleToken: token does not exist");

        self.check_owner(&owner);
        self.owner_by_id.remove(&token_id);
        self.token_metadata_by_id.remove(&token_id);

        if let Some(tokens) = self.tokens_for_owner.get_mut(&owner) {
            tokens.remove(&token_id);
            if tokens.is_empty() {
                self.tokens_for_owner.remove(&owner);
            }
        }
        self.token_approvals.remove(&token_id);

        NftEvent::Burnt { token_id }
    }
    ///  Transfer token from `token_id` to address `to`
    fn transfer(&mut self, to: &ActorId, token_id: TokenId) -> NftEvent {
        let owner = *self
            .owner_by_id
            .get(&token_id)
            .expect("NonFungibleToken: token does not exist");

        self.can_transfer(token_id, &owner);
        self.check_zero_address(to);
        // assign new owner
        self.owner_by_id
            .entry(token_id)
            .and_modify(|owner| *owner = *to);
        // push token to new owner
        self.tokens_for_owner
            .entry(*to)
            .and_modify(|tokens| {
                tokens.insert(token_id);
            })
            .or_insert_with(|| {
                let mut set = HashSet::new();
                set.insert(token_id);
                set
            });
        // remove token from old owner
        if let Some(tokens) = self.tokens_for_owner.get_mut(&owner) {
            tokens.remove(&token_id);
            if tokens.is_empty() {
                self.tokens_for_owner.remove(&owner);
            }
        }
        // remove approvals if any
        self.token_approvals.remove(&token_id);

        NftEvent::Transferred {
            from: owner,
            to: *to,
            token_id,
        }
    }
    ///  Approve token from `token_id` to address `to`
    fn approve(&mut self, to: &ActorId, token_id: TokenId) -> NftEvent {
        let owner = self
            .owner_by_id
            .get(&token_id)
            .expect("NonFungibleToken: token does not exist");
        self.check_owner(owner);
        self.check_zero_address(to);
        self.check_approve(&token_id);
        self.token_approvals.insert(token_id, *to);

        NftEvent::Approved {
            owner: *owner,
            approved_account: *to,
            token_id,
        }
    }
    /// Get `ActorId` of the nft owner with `token_id`
    fn owner(&self, token_id: TokenId) -> NftEvent {
        let owner = self
            .owner_by_id
            .get(&token_id)
            .expect("NonFungibleToken: token does not exist");

        NftEvent::Owner {
            owner: *owner,
            token_id,
        }
    }
    /// Get confirmation about approval to address `to` and `token_id`
    fn is_approved_to(&self, to: &ActorId, token_id: TokenId) -> NftEvent {
        if !self.owner_by_id.contains_key(&token_id) {
            panic!("Token does not exist")
        }
        self.token_approvals.get(&token_id).map_or_else(
            || NftEvent::IsApproved {
                to: *to,
                token_id,
                approved: false,
            },
            |approval_id| NftEvent::IsApproved {
                to: *to,
                token_id,
                approved: *approval_id == *to,
            },
        )
    }
    //...
}
```

### Program metadata and state
Metadata interface description:

```rust title="nft/io/src/lib.rs"
pub struct NftMetadata;

impl Metadata for NftMetadata {
    type Init = In<InitNft>;
    type Handle = InOut<NftAction, NftEvent>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = InOut<StateQuery, StateReply>;
}
```

It is possible to get a partial state: 

```rust title="nft/io/src/lib.rs"
pub enum StateQuery {
    All,
    Config,
    Collection,
    Owner,
    CurrentTokenId,
    OwnerById { token_id: TokenId },
    TokenApprovals { token_id: TokenId },
    TokenMetadata { token_id: TokenId },
    OwnerTokens { owner: ActorId },
}
```

```rust title="nft/io/src/lib.rs"
pub enum StateReply {
    All(State),
    Config(Config),
    Collection(Collection),
    Owner(ActorId),
    CurrentTokenId(TokenId),
    OwnerById(Option<ActorId>),
    TokenApprovals(Option<ActorId>),
    TokenMetadata(Option<TokenMetadata>),
    OwnerTokens(Option<Vec<TokenId>>),
}
```

To display the contract state information, the `state()` function is used:

```rust title="nft/io/src/lib.rs"
#[no_mangle]
extern fn state() {
    let nft = unsafe { NFT.take().expect("Unexpected error in taking state") };
    let query: StateQuery = msg::load().expect("Unable to load the state query");
    match query {
        StateQuery::All => {
            msg::reply(StateReply::All(nft.into()), 0).expect("Unable to share the state");
        }
        StateQuery::Config => {
            msg::reply(StateReply::Config(nft.config), 0).expect("Unable to share the state");
        }
        StateQuery::Collection => {
            msg::reply(StateReply::Collection(nft.collection), 0)
                .expect("Unable to share the state");
        }
        StateQuery::Owner => {
            msg::reply(StateReply::Owner(nft.owner), 0).expect("Unable to share the state");
        }
        StateQuery::CurrentTokenId => {
            msg::reply(StateReply::CurrentTokenId(nft.token_id), 0)
                .expect("Unable to share the state");
        }
        StateQuery::OwnerById { token_id } => {
            msg::reply(
                StateReply::OwnerById(nft.owner_by_id.get(&token_id).cloned()),
                0,
            )
            .expect("Unable to share the state");
        }
        StateQuery::TokenApprovals { token_id } => {
            let approval = nft.token_approvals.get(&token_id).cloned();
            msg::reply(StateReply::TokenApprovals(approval), 0).expect("Unable to share the state");
        }
        StateQuery::TokenMetadata { token_id } => {
            msg::reply(
                StateReply::TokenMetadata(nft.token_metadata_by_id.get(&token_id).cloned()),
                0,
            )
            .expect("Unable to share the state");
        }
        StateQuery::OwnerTokens { owner } => {
            let tokens = nft
                .tokens_for_owner
                .get(&owner)
                .map(|hashset| hashset.iter().cloned().collect());
            msg::reply(StateReply::OwnerTokens(tokens), 0).expect("Unable to share the state");
        }
    }
}
```


## Conclusion

An NFT smart contract source code is available on [Github](https://github.com/gear-foundation/dapps/tree/master/contracts/nft).

See also an example of the smart contract testing implementation based on `gtest` and `gclient`: [gear-foundation/dapps/contracts/nft/tests](https://github.com/gear-foundation/dapps/tree/master/contracts/nft/tests).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
