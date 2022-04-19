---
sidebar_label: 'ERC-20'
sidebar_position: 3
---

# 什么是 ERC-20?

ERC20 是以太坊区块链上创建和发行智能合约的标准。它是由以太坊开发者在2015年代表以太坊社区创建的，并于2017年被正式认可。

这些智能合约可以用来创建代币化资产，代表以太坊区块链上的任何东西，例如：

- 游戏中的代币

- 类似公司股票这样的金融工具

- 法定货币，比如美元

- 黄金

这些通证化的资产被称为 `Fungible Token`，给定的 ERC20 Token 的所有实例都是相同的，它们之间可以互换。唯一且不能互换的 Token 被称为 NFT (Non-Fungible Token)。

## 存储结构

```rust
struct FungibleToken {
    name: String, /// Name of the token.
    symbol: String,  /// Symbol of the token.
    total_supply: u128, /// Total supply of the token.
    balances: BTreeMap<ActorId, u128>, /// Map to hold balances of token holders.
    allowances: BTreeMap<ActorId, BTreeMap<ActorId, u128>>, /// Map to hold allowance information of token holders.
}
```

### `Action` 和 `Event`

`Event` 在 `Action` 触发时生成。 `Action` 包装了大量的 `Input` 结构，`Event` 包装了 `Reply`。

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

### `Action` 和 `Event` 中使用的 Message/Reply 结构

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


## ERC-20 函数

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

## Gear 的 ERC-20 范例

由 Gear 提供的智能合约源码在 Github 上可以找到： [fungible-token/src/lib.rs](https://github.com/gear-tech/apps/blob/master/fungible-token/src/lib.rs)。

同样可以找到基于 `gtest` 实现的智能合约测试范例： [fungible-token/src/tests.rs](https://github.com/gear-tech/apps/blob/master/fungible-token/src/tests.rs)。

更多关于在 Gear 上测试智能合约的细节，请参考这篇文章： [应用测试](/developing-contracts/testing.md)。