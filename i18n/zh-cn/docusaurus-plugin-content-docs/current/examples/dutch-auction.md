---
sidebar_label: '荷兰式拍卖'
sidebar_position: 10
---

# 荷兰式拍卖

## 介绍

&nbsp;&nbsp;&nbsp;&nbsp; 荷兰式拍卖是购买或出售商品的几种拍卖类型之一。最常见的是，在拍卖中，在出售过程中，拍卖师以高价开始，然后降低价格，直到一些参与者接受这个价格，或者达到预定的底价。荷兰式拍卖也被称为时钟拍卖或公开叫价降价式拍卖。这种类型的拍卖展现了速度优势，因为一次拍卖不需要超过一个出价。<br/>

&nbsp;&nbsp;&nbsp;&nbsp;该拍卖使用[Gear NFT](https://wiki.gear-tech.io/developing-contracts/examples/gnft-721)作为交易商品。如果你想深入了解，请阅读相关资料。

## 合约说明

### Actions

```rust
pub enum Action {
    Buy,
    Create(CreateConfig),
    ForceStop,
}
```

- `Buy` 按当前价格购买 GNFT 代币
- `Create(CreateConfig)` 用于创建一个新的拍卖，如果上一个拍卖已经结束，或者这是这个合约中的第一个拍卖<br/>
- `ForceStop` 如果合约所有者希望提前完成拍卖，拍卖是否可以强行终止

> Note how DutchAuction is composed; that allows users to reuse its functionality over and over again.

> 注意荷兰式拍卖是如何组成的;这允许用户反复使用它的功能。

#### actions 结构：

```rust
pub struct CreateConfig {
    pub nft_contract_actor_id: ActorId,
    pub token_owner: ActorId,
    pub token_id: U256,
    pub starting_price: u128,
    pub discount_rate: u128,
    pub duration: Duration,
}
```

**要创建一个新的拍卖，需要有以下字段：**

- `nft_contract_actor_id` 是合约地址，拍卖商的 NFT 已被铸造
- `token_owner` 是 token 所有者的地址，如果有人购买了他的 NFT，可以给他发送奖励
- `token_id` 是 NFT 的 id
- `starting_price` 是拍卖起始价格和开始下降的价格
- `discount_rate` 是价格随时间每毫秒下降的数量
- `duration` 用来设置拍卖的持续时间

```rust
pub struct Duration {
    pub days: u64,
    pub hours: u64,
    pub minutes: u64,
}
```

- `days` 拍卖持续的时间，单位是天
- `hours` 拍卖持续的时间，单位是小时
- `minutes` 拍卖持续的时间，单位是分钟

### Events

```rust
pub enum Event {
    AuctionStarted {
        token_owner: ActorId,
        price: u128,
        token_id: U256,
    },
    AuctionStoped {
        token_owner: ActorId,
        token_id: U256,
    },
}
```

- `AuctionStarted` 是当某人成功调用`Create(CreateConfig)`时发生的事件
- `AuctionStoped` 是合约所有者强制终止拍卖的事件

### State

_合约请求：_

```rust
pub enum State {
    TokenPrice(),
    IsActive(),
    Info(),
}
```

- `TokenPrice` 得到 NFT 的当前价格
- `IsActive` 得到拍卖是否已经结束的状态信息
- `Info` 向用户显示更多的拍卖信息

每个状态请求都有一个同名的响应。

_消息回复：_

```rust
pub enum StateReply {
    TokenPrice(u128),
    IsActive(bool),
    Info(AuctionInfo),
}
```

- `TokenPrice` 有一个与当前值相关联的值，单位为 units
- `IsActive` 表示拍卖尚未结束
- `Info` 是 `AuctionInfo` 类型的值

#### Structures in state replies:

```rust
pub struct AuctionInfo {
    pub nft_contract_actor_id: ActorId,
    pub token_id: U256,
    pub token_owner: ActorId,
    pub starting_price: u128,
}
```

- `nft_contract_actor_id` 是合约地址，拍卖商的 NFT 已被铸造
- `token_owner` 是 token 所有者的地址，如果有人购买了他的 NFT，可以给他发送奖励
- `token_id` 是 NFT 的 id
- `starting_price` 是拍卖起始价格和开始下降的价格

## Source code

荷兰式拍卖的合约源代码可以在 [GitHub](https://github.com/gear-tech/apps/blob/master/escrow) 找到。

同样可以找到基于 gtest 实现的智能合约测试范例：[dutch-auction/tests/dutch_auction_tests.rs](https://github.com/gear-tech/apps/tree/master/dutch-auction/tests/dutch_auction_tests.rs)。

更多关于在 Gear 的测试智能合约的细节，请参考这篇文章：[应用测试](https://wiki.gear-tech.io/zh-cn/developing-contracts/testing/)。
