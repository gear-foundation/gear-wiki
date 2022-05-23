---
sidebar_label: '第三方担保'
sidebar_position: 8
---

# 第三方担保是什么?

第三方担保是一个特殊的账户，某些资产(如金钱或股票)被存入该账户，并被保存到满足某些条件。就智能合约而言，托管是存储在区块链上的程序，与常规托管一样，可以从一个用户那里接收一些资产(例如加密资产或代币)，并在满足特定条件时将它们发送给另一个用户。

这篇文章将展示1个第三方担保的智能合约案例，其中资产是[Gear 同质化代币 - GFT](https://wiki.gear-tech.io/developing-contracts/examples/gft-20)。

## 业务逻辑

* 任何用户都可以创建合约，作为买方或卖方
* 买方可以支付定金并确认合同
* 卖方可以将已付款合同中的代币退还给买方
* 买卖双方都可以取消未付款合同

一个担保合约包含了“买方”、“卖方”信息和各自的“状态”，以及可以担保的代币的“数量”信息：

```rust
struct Contract {
    buyer: ActorId,
    seller: ActorId,
    state: State,
    amount: u128,
}
```

`State`是一个枚举类型，用于存储合约约的当前状态:

```rust
enum State {
    AwaitingDeposit,
    AwaitingConfirmation,
    Completed,
}
```

## 接口

### 方法

```rust
fn create(&mut self, buyer: ActorId, seller: ActorId, amount: u128)
```

创建一个担保合约并回复该合约的ID。

必要条件：
* `msg::source()` 必须是该合约的买方或卖方。

参数：
* `buyer`：买方
* `seller`：卖方
* `amount`： 代币数量

```rust
async fn deposit(&mut self, contract_id: u128)
```

买方把钱存入担保账户，合约状态改为 `AwaitingConfirmation`。

必要条件：
* `msg::source()` 必须是保存在合约中的买方
* 合约必须是未支付状态，并且合约是未完成状态

参数：
* `contract_id`: a contract ID.

```rust
async fn confirm(&mut self, contract_id: u128)
```

通过将代币从托管账户转移给卖方来确认合同给卖方，并将合同状态改为 `Completed`。

必要条件：
* `msg::source()`  必须是保存在合约中的卖方
* Contract must be paid and uncompleted.
* 合约必须是已支付状态并且合约是未完成状态

参数：
* `contract_id`：合约 ID

```rust
async fn refund(&mut self, contract_id: u128)
```

将代币从托担保账户中退还给买方并将合同状态改为 `AwaitingDeposit`(也就是说，合约可以重复使用)。

必要条件：
* `msg::source()` 必须是保存在合约中的买方
* 合约必须是已支付状态并且合约是未完成状态

参数：
* `contract_id`：合约 ID

```rust
async fn cancel(&mut self, contract_id: u128)
```

取消（提前完成）一个合约，将其状态改为 `Completed`。

必要条件：
* `msg::source()` 必须是保存在合约中的买方或卖方
* 合约必须是已支付状态并且合约是已完成状态

参数：
* `contract_id`：合约 ID

### Actions & events

**Action** 是一个被发送到程序的枚举类型，包含了它应该如何处理。在成功处理**Action**后，程序用**Event**枚举进行回复，其中包含已处理的**Action**及其结果的信息。

```rust
pub enum EscrowAction {
    Create {
        buyer: ActorId,
        seller: ActorId,
        amount: u128,
    },
    Deposit {
        contract_id: u128,
    },
    Confirm {
        contract_id: u128,
    },
    Refund {
        contract_id: u128,
    },
    Cancel {
        contract_id: u128,
    },
}
```

```rust
pub enum EscrowEvent {
    Cancelled {
        buyer: ActorId,
        seller: ActorId,
        amount: u128,
    },
    Refunded {
        buyer: ActorId,
        amount: u128,
    },
    Confirmed {
        seller: ActorId,
        amount: u128,
    },
    Deposited {
        buyer: ActorId,
        amount: u128,
    },
    Created {
        contract_id: u128,
    },
}
```

### 初始化设置

```rust
pub struct InitEscrow {
    // Address of a fungible token program.
    pub ft_program_id: ActorId,
}
```

## 源码

Escrow 的合约源代码可以在 [GitHub](https://github.com/gear-tech/apps/blob/master/escrow) 找到。

更多关于在 Gear 的测试智能合约的细节，请参考这篇文章：[应用测试](https://wiki.gear-tech.io/zh-cn/developing-contracts/testing/)。
