---
sidebar_label: 'ERC-20'
sidebar_position: 3
---

# 什么是 ERC-20?

ERC20是以太坊区块链上创建和发行智能合约的标准。它是由以太坊开发者在2015年代表以太坊社区创建的，并于2017年被正式认可。
ERC20 is a standard that’s used for creating and issuing smart contracts on the Ethereum blockchain. It was created by Ethereum developers on behalf of the Ethereum community in 2015, and it was officially recognised in 2017. 

这些智能合约可以用来创建代币化资产，代表以太坊区块链上的任何东西，例如：
These smart contracts can then be used to create tokenized assets that represent anything on the Ethereum blockchain like:

- 游戏中的代币

- 类似公司股票这样的金融工具

- 法定货币，比如美元

- 黄金

这些通证化的资产被称为 `Fungible Token`，给定的 ERC20 Token 的所有实例都是相同的，它们之间可以互换。唯一且不能互换的 Token 被称为 NFT (Non-Fungible Token)。

# 存储结构

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

`Event` 在 `Action` 触发时生成。 `Action` 包装了大量的 `Input` 结构，`Event` 包装了 `Reply`。

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

### `Action` 和 `Event` 中使用的 Message/Reply 结构

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
    pub new_limit: u128
}
```

# ERC-20 函数

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
    fn balance_of(&self, account: &ActorId)
```
