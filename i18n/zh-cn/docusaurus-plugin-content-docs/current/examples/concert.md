---
sidebar_label: Concert (FT 转为 NFT)
sidebar_position: 13
---

# Concert 合约 (FT 转为 NFT)

## 介绍

Concert 是一个将同质化代币（FT）实时转换为非同质化代币的想法的界面。一个已经部署好的合约一次可以举办一场音乐会。首先，音乐会的所有门票都是同质化代币。为了购买门票，人们应该提供元数据（如座位/排号），这些元数据稍后将被包含在 NFTs 中。

当音乐会举行时，所有用户（持票人）的所有同质化代币都将变成 NFT。

这个想法很简单，所有内部代币交互都是使用 GMT-1155 合约，在初始化一个 concert 合约时必须提供该地址。

## 接口

### Events

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum ConcertEvent {
    Creation {
        creator: ActorId,
        concert_id: u128,
        number_of_tickets: u128,
        date: u128,
    },
    Hold {
        concert_id: u128,
    },
    Purchase {
        concert_id: u128,
        amount: u128,
    },
}
```
### 方法

```rust
/// Create a concert.
/// `concert_id` - is the id of the concert (will become a TokenId for FT minted later).
/// `number_of_tickets` - is the amount of FT minted later.
/// `date` - is the date of the concert holding.
fn create_concert(
    &mut self,
    creator: ActorId,
    concert_id: u128,
    number_of_tickets: u128,
    date: u128,
);

/// Buy tickets.
/// `concert_id` - is the id of the concert.
/// `amount` - is the number of tickets one is trying to purchase.
/// `mtd` - is the tickets metadata (e.g. seat/row). This argument length should equal the `amount` value.
async fn buy_tickets(
    &mut self,
    concert_id: u128,
    amount: u128,
    mtd: Vec<Option<TokenMetadata>>,
);

/// Hold a concert, turning of the FT (aka tickets) into NFTs.
/// `concert_id` - is the id of the concert
async fn hold_concert(&mut self, concert_id: u128)
```

### 初始化配置

要成功初始化 Concert 合约，应提供 GMT-1155 合约的 ActorID 以保存所有代币操作。此消息的发送者会成为合约的所有者。

```rust
pub struct InitConcert {
    pub owner_id: ActorId,
    pub mtk_contract: ActorId,
}
```

### `Action` 结构

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum ConcertAction {
    Create {
        creator: ActorId,
        concert_id: u128,
        number_of_tickets: u128,
        date: u128,
    },
    Hold {
        concert_id: u128,
    },
    BuyTickets {
        concert_id: u128,
        amount: u128,
        metadata: Vec<Option<TokenMetadata>>,
    },
}
```

## 结论

Concert 的源代码和其测试的实例源码在 GitHub 上：[`concert/src/lib.rs`](https://github.com/gear-dapps/concert/blob/master/src/lib.rs)。

同样可以找到基于 `gtest` 实现的智能合约测试范例：[`concert/tests/concert_tests.rs`](https://github.com/gear-dapps/concert/blob/master/tests/concert_tests.rs)。

更多关于在 Gear 上测试智能合约的细节，请参考这篇文章：[应用测试](/developing-contracts/testing)。
