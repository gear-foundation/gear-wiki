---
sidebar_label: gFT (ERC-20)
sidebar_position: 3
---

# Gear Fungible Token

## What is ERC-20?

ERC-20 is a standard that’s used for creating and issuing smart contracts on the Ethereum blockchain. It was created by Ethereum developers on behalf of the Ethereum community in 2015, and it was officially recognised in 2017.

These smart contracts can then be used to create tokenized assets that represent anything on the Ethereum blockchain like:

- In-game currency

- Financial instruments like a share in a company

- Fiat currencies, like USD for example

- Ounces of Gold

These tokenized assets are known as fungible tokens as all instances of a given ERC-20 token are the same and they can be used interchangeably. A token that is unique and can not be interchangeable is known as a Non Fungible Token.

Gear provides native implementaion of fungible token (gFT) described in this article.

## Storage Structure

```rust
struct FungibleToken {
    name: String, /// Name of the token.
    symbol: String,  /// Symbol of the token.
    total_supply: u128, /// Total supply of the token.
    balances: BTreeMap<ActorId, u128>, /// Map to hold balances of token holders.
    allowances: BTreeMap<ActorId, BTreeMap<ActorId, u128>>, /// Map to hold allowance information of token holders.
}
```

### `Action` and `Event`

`Event` is generated when `Action` is triggered. `Action` enum wraps various `Input` structs, `Event` wraps `Reply`.

```rust
#[derive(Debug, Decode, Encode, TypeInfo)]
pub enum Action {
    Mint(u128),
    Burn(u128),
    Transfer {
        from: ActorId,
        to: ActorId,
        amount: u128,
    },
    Approve {
        to: ActorId,
        amount: u128,
    },
    TotalSupply,
    BalanceOf(ActorId),
}
```

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum Event {
    Transfer {
        from: ActorId,
        to: ActorId,
        amount: u128,
    },
    Approve {
        from: ActorId,
        to: ActorId,
        amount: u128,
    },
    TotalSupply(u128),
    Balance(u128),
}
```

### Message/Reply structures used in `Action` and `Event`

```rust
#[derive(Debug, Decode, Encode, TypeInfo)]
pub struct InitConfig {
    pub name: String,
    pub symbol: String,
}
```

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct ApproveInput {
    pub spender: ActorId,
    pub amount: u128,
}
```

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct ApproveReply {
    pub owner: ActorId,
    pub spender: ActorId,
    pub amount: u128,
}
```

```rust
#[derive(Debug, Decode, Encode, TypeInfo)]
pub struct TransferInput {
    pub to: ActorId,
    pub amount: u128,
}
```

## gFT functions

```rust
    /// Minting the specified `amount` of tokens for the account that called this function.
    fn mint(&mut self, amount: u128)

    /// Burning the specified `amount` of tokens for the `account` that called this function
    fn burn(&mut self, amount: u128)

    /// Transfers `amount` tokens from `sender` account to `recipient` account.
    fn transfer(&mut self, from: &ActorId, to: &ActorId, amount: u128)

    /// Adds/Updates allowance entry for `spender` account to tranfer upto `amount` from `owner` account.
    fn approve(&mut self, to: &ActorId, amount: u128)

```

## Conclusion

A source code of the contract example provided by Gear is available on GitHub: [fungible-token/src/lib.rs](https://github.com/gear-dapps/fungible-token/blob/master/src/lib.rs).

See also an example of the smart contract testing implementation based on `gtest`: [fungible-token/src/tests.rs](https://github.com/gear-dapps/fungible-token/blob/master/src/tests.rs).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/developing-contracts/testing).
