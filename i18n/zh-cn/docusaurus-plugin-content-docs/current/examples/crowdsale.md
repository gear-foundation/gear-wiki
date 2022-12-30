---
sidebar_label: 众筹
sidebar_position: 18
---

# 众筹智能合约机制

## 介绍

公开发售投资全新的加密货币或其他数字资产，被称为加密货币公开发售。众筹可以被新项目用来为开发和其他目的筹集资金。公开发售是一个有时间限制的活动，投资者可以将他们在活动中定义的加密货币兑换成新发行的代币。新的代币在公开发售的融资目标达到和项目启动后，作为未来的功能被推广。

本文所描述的众筹智能合约实现的例子是在 Gear 上实现和发布的去中心化应用之一。这篇文章介绍了接口、数据结构、基本功能，并解释了它们的用途。代码可以直接使用，也可以根据自己的场景进行修改。任何人都可以轻松创建自己的众筹应用，并在 Gear 网络上运行。

购买代币的初始资金由 Gear 同质化代币合约决定 - [gFT](https://wiki.gear-tech.io/examples/gft-20)。
合约源代码可在[GitHub](https://github.com/gear-dapps/crowdsale)上找到。

## 界面

### 源码

1. `messages.rs` - 包含同质化币合约的功能。公开发售合约通过 transfer_tokens 函数与同质化代币合约进行交互。

```rust
pub async fn transfer_tokens(
    transaction_id: u64, // - associated transaction id
    token_id: &ActorId, // - the fungible token contract address
    from: &ActorId, // - the sender address
    to: &ActorId, // - the recipient address
    amount: u128, // - the amount of tokens
)
```

这个函数发送一个信息（action 在枚举 IcoAction 中定义）并得到一个回复（回复在枚举 IcoEvent 中定义）。

```rust
let _transfer_response =  msg::send_for_reply_as::<ft_main_io::FTokenAction, FTokenEvent>(
    *token_address,
    FTokenAction::Message {
        transaction_id,
        payload: ft_logic_io::Action::Transfer {
            sender: *from,
            recipient: *to,
            amount: amount_tokens,
        }
        .encode(),
    },
    0,
)
.expect("Error in sending a message `FTokenAction::Message`")
.await
.expect("Error in transfer");
```

2. `asserts.rs` - 包含断言功能：`owner_message` 和 `not_zero_address`。

- `owner_message` - 检查 `msg::source()` 是否等于 `owner`。否则，会报错。

```rust
pub fn owner_message(owner: &ActorId, message: &str) {
    if msg::source() != *owner {
        panic!("{}: Not owner message", message)
    }
}
```
- `not_zero_address` 检查 `address` 是否等于 `ZERO_ID`。否则，会报错：

```rust
pub fn not_zero_address(address: &ActorId, message: &str) {
    if address == &ZERO_ID {
        panic!("{}: Zero address", message)
    }
}
```

3. `lib.rs` - 定义合约逻辑

### 代码结构
`Cargo.toml`
```toml
[dependecies]
# ...
hashbrown = "0.13.1"
```

该合约有以下结构：

```rust
use hashbrown::HashMap;

struct IcoContract {
    ico_state: IcoState,
    start_price: u128,
    price_increase_step: u128,
    time_increase_step: u128,
    tokens_sold: u128,
    tokens_goal: u128,
    owner: ActorId,
    token_address: ActorId,
    token_holders: HashMap<ActorId, u128>,
    transaction_id: u64,
    transactions: HashMap<ActorId, u64>,
}
```

- `ico_state` 是 `IcoState` 结构，由以下部分组成：

```rust
pub struct IcoState {
    pub ico_started: bool, // true if started
    pub start_time: u64, // time when started, otherwise is zero
    pub duration: u64, // duration, otherwise is zero
    pub ico_ended: bool, // true if ended
}
```
- `start_price` - 代币初始价格
- `price_increase_step` -  价格上涨幅度
- `time_increase_step` -  价格上涨后的时间段
- `tokens_sold`  - 出售了多少代币
- `tokens_goal` -  将出售多少代币
- `owner` - 合约所有者
- `token_address` - 同质化代币地址
- `token_holders` - 买家名单和他们购买的代币数量

### 方法

- 开始公开发售。只有所有者可以调用：

```rust
async fn start_ico(&mut self, config: IcoAction)
```

回复以下消息：

```rust
IcoEvent::SaleStarted {
    transaction_id,
    duration,
    start_price,
    tokens_goal,
    price_increase_step,
    time_increase_step,
},
```

- 购买代币。任何有足够余额的人都可以购买代币：

```rust
pub fn buy_tokens(&mut self, tokens_cnt: u128)
```

回复以下消息：

```rust
IcoEvent::Bought {
    buyer,
    amount,
    change,
}
```

- 结束公开发售。只有所有者可以调用：

```rust
async fn end_sale(&mut self)
```

回复以下消息：

```rust
IcoEvent::SaleEnded
```

## 总结

公开发售合约源码在 [Github](https://github.com/gear-dapps/crowdsale)。

更多关于在 Gear 上测试智能合约的细节，请参考这篇文章：[程序测试](/developing-contracts/testing.md)。
