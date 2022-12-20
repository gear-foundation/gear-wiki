---
sidebar_label: gNFT (ERC-721)
sidebar_position: 4
---

# Gear Non-Fungible Token

### Introduction
Non-fungible tokens (NFTs) are unique cryptographic tokens on a blockchain that are used to prove an ownership of a digital asset, such as digital art or gaming assets. The difference from fungible tokens is that the fungible tokens store a value, while non-fungible tokens store a cryptographic certificate.

Under the hood, a non-fungible token consists of a unique token identifier, or token ID, which is mapped to an owner identifier and stored inside a NFT smart contract.<center> <em><strong>token_id</strong></em> → <em><strong>address</strong></em> </center>

When the owner of a given token ID wishes to transfer it to another user, it is easy to verify ownership and reassign the token to a new owner.

This article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own application and run it on the Gear Network. The source code of the Gear NFT smart contract example is available on [GitHub](https://github.com/gear-dapps/non-fungible-token).

### Default non-fungible-token implementation
The functions that must be supported by each non-fungible-token contract:
- *transfer(to, token_id)* - is a function that allows you to transfer a token with the *token_id* number to the *to* account;
- *approve(approved_account, token_id)* - is a function that allows you to give the right to dispose of the token to the specified *approved_account*. This functionality can be useful on marketplaces or auctions as when the owner wants to sell his token, they can put it on a marketplace/auction, so the contract will be able to send this token to the new owner at some point;
- *mint(to, token_id, metadata)* is a function that creates a new token. Metadata can include any information about the token: it can be a link to a specific resource, a description of the token, etc;
- *burn(from, token_id)* is a function that removes the token with the mentioned *token_id* from the contract.

The default implementation of the NFT contract is provided in the gear library: [gear-lib/non_fungible_token](https://github.com/gear-dapps/gear-lib/tree/master/lib/src/non_fungible_token).

To use the default implementation you should include the packages into your *Cargo.toml* file:

```toml
gear-lib = { git = "https://github.com/gear-dapps/gear-lib.git" }
gear-lib-derive = { git = "https://github.com/gear-dapps/gear-lib.git" }
```

The states that non-fungible-contract store are defined in the struct `NFTState`:

```rust
#[derive(Debug, Default)]
pub struct NFTState {
    pub name: String,
    pub symbol: String,
    pub base_uri: String,
    pub owner_by_id: BTreeMap<TokenId, ActorId>,
    pub token_approvals: BTreeMap<TokenId, Vec<ActorId>>,
    pub token_metadata_by_id: BTreeMap<TokenId, Option<TokenMetadata>>,
    pub tokens_for_owner: BTreeMap<ActorId, Vec<TokenId>>,
    pub royalties: Option<Royalties>,
}
```

To reuse the default struct you need derive the NFTStateKeeper trait and mark the corresponding field with the #[NFTStateField] attribute.  You can also add your fields in your NFT contract. For example, let's add the owner's address to the contract and the `token_id` that will track the current number of token:

```rust
use derive_traits::{NFTStateKeeper, NFTCore, NFTMetaState};
use gear_contract_libraries::non_fungible_token::{nft_core::*, state::*, token::*};

#[derive(Debug, Default, NFTStateKeeper, NFTCore, NFTMetaState)]
pub struct NFT {
    #[NFTStateField]
    pub token: NFTState,
    pub token_id: TokenId,
    pub owner: ActorId,
}
```

To inherit the default logic functions you need to derive NFTCore trait. Accordingly, for reading contracts states you need NFTMetaState trait.

Let's write the whole implementation of the NFT contract. First, we define the message
which will initialize the contract and messages that our contract will process:

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct InitNFT {
    pub name: String,
    pub symbol: String,
    pub base_uri: String,
}

pub enum NFTAction {
    Mint {
        to: ActorId,
        token_id: TokenId,
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
}
```

Then the default NFT contract implementation:

```rust
#[derive(Debug, Default, NFTStateKeeper, NFTCore, NFTMetaState)]
pub struct NFT {
    #[NFTStateField]
    pub token: NFTState,
    pub token_id: TokenId,
    pub owner: ActorId,
}

static mut CONTRACT: Option<NFT> = None;

#[no_mangle]
extern "C" fn init() {
    let config: InitNFT = msg::load().expect("Unable to decode InitNFT");
    let mut nft = NFT::default();
    nft.token.name = config.name;
    nft.token.symbol = config.symbol;
    nft.token.base_uri = config.base_uri;
    nft.owner = msg::source();
    unsafe { CONTRACT = Some(nft) };
}

#[no_mangle]
extern "C" fn handle() {
    let action: NFTAction = msg::load().expect("Could not load msg");
    let nft = unsafe { CONTRACT.get_or_insert(NFT::default()) };
    match action {
        NFTAction::Mint { to, token_id } => NFTCore::mint(&to, token_id, None),
        NFTAction::Burn { token_id } => NFTCore::burn(nft, token_id),
        NFTAction::Transfer { to, token_id } => NFTCore::transfer(nft, &to, token_id),
        NFTAction::Approve { to, token_id } => NFTCore::approve(nft, &to, token_id),
    }
}
```

### Developing your non-fungible-token contract
Next, let's rewrite the implementation of `mint` function. Our `mint` function will create token for the account that send `Mint` message  and require the metadata as an input argument:
```rust
pub enum NFTAction {
    Mint {
        token_metadata: TokenMetadata,
        token_id: TokenId,
    },
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
Define a trait for our new function that will extend the default `NFTCore` trait:
```rust
pub trait MyNFTCore: NFTCore {
    fn mint(&mut self, token_metadata: TokenMetadata);
}
```
and write the implementation of that trait:
```rust
impl MyNFTCore for NFT {
    fn mint(&mut self, token_metadata: TokenMetadata) {
        NFTCore::mint(self, &msg::source(), self.token_id, Some(token_metadata));
        self.token_id = self.token_id.saturating_add(U256::one());
    }
}
```
Accordingly, it is necessary to make changes to the `handle` function:
```rust
#[no_mangle]
extern "C" fn handle() {
    let action: NFTAction = msg::load().expect("Could not load msg");
    let nft = unsafe { CONTRACT.get_or_insert(Default::default()) };
    match action {
        NFTAction::Mint { token_metadata } => MyNFTCore::mint(token_metadata),
        NFTAction::Burn { token_id } => NFTCore::burn(nft, token_id),
        NFTAction::Transfer { to, token_id } => NFTCore::transfer(nft, &to, token_id),
        NFTAction::Approve { to, token_id } => NFTCore::approve(nft, &to, token_id),
    }
}
```

## Conclusion

Gear provides a reusable [library](https://github.com/gear-dapps/gear-lib/tree/master/lib/src/non_fungible_token) with core functionality for the gNFT protocol. By using object composition, that library can be utilized within a custom NFT contract implementation in order to minimize duplication of community available code.

A source code of the Gear NFT smart contract example based on `gear-lib` is available on GitHub: [gear-dapps/non-fungible-token](https://github.com/gear-dapps/non-fungible-token).

See also an example of the smart contract testing implementation based on `gtest`: [gear-dapps/non-fungible-token/tests](https://github.com/gear-dapps/non-fungible-token/tree/master/tests).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
