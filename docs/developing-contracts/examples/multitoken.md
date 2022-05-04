---
sidebar_label: 'Multitoken'
sidebar_position: 5
---

# Multitoken

## Introduction

A standard interface for contracts that manage multiple token types. A single deployed contract may include any combination of fungible tokens, non-fungible tokens or other configurations (e.g. semi-fungible tokens).

The idea is simple and seeks to create a smart contract interface that can represent and control any number of fungible and non-fungible token types. In this way, the MTK can do the same functions as an ERC-20 and ERC-721 token, and even both at the same time.

## Interface


### Events

```rust
// `TransferSingle` MUST emit when tokens are transferred, including zero value transfers as well as minting or burning
TransferSingle {
    operator: ActorId,
    from: ActorId,
    to: ActorId,
    id: u128,
    amount: u128,
}

// `TransferBatch` MUST emit when tokens are transferred, including zero value transfers as well as minting or burning
TransferBatch {
    operator: ActorId,
    from: ActorId,
    to: ActorId,
    ids: Vec<u128>,
    values: Vec<u128>,
}

// MUST emit when approval for a second party/operator address to manage all tokens for an owner address is enabled or disabled (absence of an event assumes disabled)
Approve {
    from: ActorId,
    to: ActorId,
}
```

### Functions

```rust
// Get the balance of an account's tokens
fn balance_of(&self, account: &ActorId, id: &TokenId)

// Get the balance of multiple account/token pairs
fn balance_of_batch(&self, accounts: &[ActorId], ids: &[u128]) -> Vec<BalanceOfBatchReply>;

// Enable approval for a third party ("operator") to manage all of the caller's tokens, and MUST emit the Approve event
fn approve(&mut self, to: &ActorId);

// Disable approval for a third party ("operator") to manage all of the caller's tokens, and MUST emit the Approve event
fn revoke_approval(&mut self, to: &ActorId);

// Transfers amount of tokens from address to other address, and MUST emit the TransferSingle event
fn transfer_from(&mut self, from: &ActorId, to: &ActorId, id: &TokenId, amount: u128);

// Transfers  multiple type amount of tokens from address to other address, and MUST emit the TransferBatch event
fn batch_transfer_from(
    &mut self,
    from: &ActorId,
    to: &ActorId,
    ids: &[TokenId],
    amounts: &[u128],
);

// Add tokens to an address, and MUST emit TransferSingle event
fn mint(&mut self, account: &ActorId, id: &TokenId, amount: u128, meta: Option<TokenMetadata>);


// Add multiple token types to an address, and MUST emit TransferSingle event
fn mint_batch(
    &mut self,
    account: &ActorId,
    ids: &[TokenId],
    amounts: &[u128],
    meta: Vec<Option<TokenMetadata>>,
)

// Remove token from a user, and MUST emit the TransferSingle event
fn burn(&mut self, id: &TokenId, amount: u128);

// Remove multiple token types from a user, and MUST emit the TransferSingle event
fn burn_batch(&mut self, ids: &[TokenId], amounts: &[u128]);
```

### Init Config

```rust
pub struct InitConfig {
    pub name: String,
    pub symbol: String,
    pub base_uri: String,
}
```


### Metadata

Since MTK should be able to handle NFTs we need a way to provide and store a Metadata. The struct for metadata is provided below:

```rust
pub struct TokenMetadata {
    pub title: Option<String>,
    pub description: Option<String>,
    pub media: Option<String>,
    pub reference: Option<String>,
}
```

### `Event` Structure

```rust
pub enum MTKEvent {
    TransferSingle(TransferSingleReply),
    Balance(u128),
    BalanceOfBatch(Vec<BalanceOfBatchReply>),
    MintOfBatch(Vec<BalanceOfBatchReply>),
    TransferBatch {
        operator: ActorId,
        from: ActorId,
        to: ActorId,
        ids: Vec<TokenId>,
        values: Vec<u128>,
    },
    Approve {
        from: ActorId,
        to: ActorId,
    },
}

#[derive(Debug, Decode, Encode, TypeInfo)]
pub struct TransferSingleReply {
    pub operator: ActorId,
    pub from: ActorId,
    pub to: ActorId,
    pub id: u128,
    pub amount: u128,
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct BalanceOfBatchReply {
    pub account: ActorId,
    pub id: u128,
    pub amount: u128,
}
```

## Conclusion

A source code of the Multitoken core implementation is available on GitHub: [`gear-contract-libraries`](https://github.com/gear-tech/apps/blob/masater/gear-contract-libraries/multitoken)

A source code of the contract example provided by Gear is available on GitHub: [`miltitoken/src/lib.rs`](https://github.com/gear-tech/apps/blob/master/multitoken/src/lib.rs).

See also an example of the smart contract testing implementation based on gtest: [`multitoken/tests/tests.rs`](https://github.com/gear-tech/apps/blob/master/multitoken/tests/mtk_tests.rs).

For more details about testing smart contracts written on Gear, refer to this article: [Program testing](https://wiki.gear-tech.io/developing-contracts/testing).
