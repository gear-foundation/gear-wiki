---
sidebar_label: 'ERC-20'
sidebar_position: 3
---

# What is ERC-20?

ERC20 is a standard that’s used for creating and issuing smart contracts on the Ethereum blockchain. It was created by Ethereum developers on behalf of the Ethereum community in 2015, and it was officially recognised in 2017. 

These smart contracts can then be used to create tokenized assets that represent anything on the Ethereum blockchain like:

- In-game currency

- Financial instruments like a share in a company

- Fiat currencies, like USD for example

- Ounces of Gold

These tokenized assets are known as fungible tokens as all instances of a given ERC20 token are the same and they can be used interchangeably. A token that is unique and can not be interchangeable is known as a Non Fungible Token.

## Storage Structure

```rust
struct FungibleToken {
    name: String,    /// Name of the token.
    symbol: String,    /// Symbol of the token.
    total_supply: u128,    /// Total supply of the token.
    balances: BTreeMap<ActorId, u128>,    /// Map to hold balances of token holders.
    allowances: BTreeMap<ActorId, BTreeMap<ActorId, u128>>,    /// Map to hold allowance information of token holders.
    creator: ActorId,    /// Creator of the token.
    admins: BTreeSet<ActorId>,    /// Creator approved set of admins, who can do mint/burn.
}
```

### `Action` and `Event`

`Event` is generated when `Action` is triggered. `Action` enum wraps various `Input` structs, `Event` wraps `Reply`.

```rust
#[derive(Debug, Decode, Encode, TypeInfo)]
pub enum Action {
    Mint(MintInput),
    Burn(BurnInput),
    Transfer(TransferInput),
    TransferFrom(TransferFromInput),
    Approve(ApproveInput),
    IncreaseAllowance(ApproveInput),
    DecreaseAllowance(ApproveInput),
    TotalIssuance,
    BalanceOf(ActorId),
    AddAdmin(ActorId),
    RemoveAdmin(ActorId),
}
```

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum Event {
    Transfer(TransferReply),
    Approval(ApproveReply),
    TotalIssuance(u128),
    Balance(u128),
    AdminAdded(ActorId),
    AdminRemoved(ActorId),
    TransferFrom(TransferFromReply),
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
#[derive(Debug, Decode, Encode, TypeInfo)]
pub struct MintInput {
    pub account: ActorId,
    pub amount: u128,
}
```

```rust
#[derive(Debug, Decode, Encode, TypeInfo)]
pub struct BurnInput {
    pub account: ActorId,
    pub amount: u128,
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

```rust
#[derive(Debug, Decode, Encode, TypeInfo)]
pub struct TransferReply {
    pub from: ActorId,
    pub to: ActorId,
    pub amount: u128,
}
```

```rust
#[derive(Debug, Decode, Encode, TypeInfo)]
pub struct TransferFromInput {
    pub owner: ActorId,
    pub to: ActorId,
    pub amount: u128,
}
```

```rust
#[derive(Debug, Decode, Encode, TypeInfo)]
pub struct TransferFromReply {
    pub owner: ActorId,
    pub sender: ActorId,
    pub recipient: ActorId,
    pub amount: u128,
    pub new_limit:
```

## ERC-20 functions

```rust
    /// Executed on receiving `fungible-token-messages::MintInput`
    /// If executed by creator or admins of the token then mints `amount` tokens into `account`.
    fn mint(&mut self, account: &ActorId, amount: u128) 

    /// Executed on receiving `fungible-token-messages::BurnInput`
    /// If executed by creator or admins of the token then burns `amount` tokens from `account`.
    fn burn(&mut self, account: &ActorId, amount: u128)

    /// Executed on receiving `fungible-token-messages::TransferInput` or `fungible-token-messages::TransferFromInput`.
    /// Transfers `amount` tokens from `sender` account to `recipient` account.
    fn transfer(&mut self, sender: &ActorId, recipient: &ActorId, amount: u128)

    /// Executed on receiving `fungible-token-messages::ApproveInput`.
    /// Adds/Updates allowance entry for `spender` account to tranfer upto `amount` from `owner` account.
    fn approve(&mut self, owner: &ActorId, spender: &ActorId, amount: u128)

    /// To find maximum value allowed to be transfer by `spender` from `owner` account. 
    fn get_allowance(&self, owner: &ActorId, spender: &ActorId) -> u128

    /// To increase allowance of `spender` for `owner` account.
    fn increase_allowance(&mut self, owner: &ActorId, spender: &ActorId, amount: u128)

    /// To decrease allowance of `spender` for `owner` account.
    fn decrease_allowance(&mut self, owner: &ActorId, spender: &ActorId, amount: u128)

    /// Transfer `amount` from `owner` account to `recipient` account if `sender`'s allowance permits. 
    fn transfer_from(
        &mut self,
        owner: &ActorId,
        sender: &ActorId,
        recipient: &ActorId,
        amount: u128,
    ) -> u128

    /// Token creator account add `account` as admin to token.
    fn add_admin(&mut self, account: &ActorId)

    /// Token creator account remove `account` as admin from token.
    fn remove_admin(&mut self, account: &ActorId)

    /// Increases total token supply.
    fn increase_total_supply(&mut self, amount: u128)

    /// Decreases total token supply.
    fn decrease_total_supply(&mut self, amount: u128)

    /// Executed on receiving `fungible-token-message::BalanceOf`, returns token balance of `account`.
    fn balance_of(&self, account: &ActorId
```

## Gear's example of ERC-20

A source code of the contract example provided by Gear is available on GitHub: [fungible-token/src/lib.rs](https://github.com/gear-tech/apps/blob/master/fungible-token/src/lib.rs).

See also an example of the smart contract testing implementation based on `gtest`: [fungible-token/src/tests.rs](https://github.com/gear-tech/apps/blob/master/fungible-token/src/tests.rs).

For more details about testing smart contracts written on Gear, refer to this article: [Program testing](/developing-contracts/testing.md).
