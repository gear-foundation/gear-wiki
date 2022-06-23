---
sidebar_label: '第三方担保'
sidebar_position: 8
---

# 第三方担保是什么？

第三方担保是一个特殊的钱包，某些资产 (如金钱或股票) 被存入该账户，并被保存到满足某些条件。就智能合约而言，第三方担保是存储在区块链上的钱包，与常规担保一样，可以从一个用户那里接收一些资产 (例如加密资产或代币)，并在满足特定条件时将它们发送给另一个用户。

这篇文章将展示 1 个第三方担保的智能合约案例，其中资产是[Gear 同质化代币 - gFT](/examples/gft-20)。

## 业务逻辑

* 任何用户都可以创建合约，作为买方或卖方
* 买方可以支付定金并确认合同
* 卖方可以将已付款合同中的代币退还给买方
* 买卖双方都可以取消未付款合同

一个担保合约包含了“买方”、“卖方”信息和各自的“状态”，以及可以担保的代币的“数量”信息：

```rust
struct Wallet {
    buyer: ActorId,
    seller: ActorId,
    state: WalletState,
    amount: u128,
}
```

`WalletState`是一个枚举类型，用于存储合约约的当前状态：

```rust
enum WalletState {
    AwaitingDeposit,
    AwaitingConfirmation,
    Closed,
}
```

## 接口

### 类型别名
```rust
/// Escrow wallet ID.
type WalletId = U256;
```

### 初始化配置
```rust
pub struct InitEscrow {
    /// Address of a fungible token program.
    pub ft_program_id: ActorId,
}
```

### 方法

```rust
fn create(&mut self, buyer: ActorId, seller: ActorId, amount: u128)
```

创建一个担保钱包并回复 ID。


必要条件：
* `msg::source()` 必须是该钱包的买方或卖方

参数：
* `buyer`：买方
* `seller`：卖方
* `amount`：代币数量

```rust
async fn deposit(&mut self, wallet_id: WalletId)
```

买方把钱存入担保账户，钱包状态改为 `AwaitingConfirmation`。

必要条件：
* `msg::source()` 必须是保存在钱包中的买方
* 钱包必须是未支付状态，或者已关闭

参数：
* `wallet_id`：钱包 ID

```rust
async fn confirm(&mut self, wallet_id: WalletId)
```

通过从担保钱包转移代币来确认交易，并将钱包状态改为 `Closed`。

必要条件：
* `msg::source()` 必须是保存在钱包中的卖方
* 钱包必须是已支付状态并且是未关闭状态

参数：
* `wallet_id`：钱包 ID

```rust
async fn refund(&mut self, wallet_id: WalletId)
```

将代币从担保钱包退款给买家，并将钱包状态更改为`AwaitingDeposit`(也就是说，钱包可以重复使用)。

必要条件：
* `msg::source()` 必须是保存在钱包中的买方
* 钱包必须是已支付状态并且是未关闭状态

参数：
* `wallet_id`：钱包 ID

```rust
async fn cancel(&mut self, wallet_id: WalletId)
```

取消交易并关闭一个担保钱包，将其状态改为 `Closed`。

必要条件：
* `msg::source()` 必须是保存在钱包中的买方或卖方
* 钱包必须是已支付状态并且合约是已完成状态

参数：
* `wallet_id`：钱包 ID

### Meta state

也可以为智能合约提供报告其状态的能力，而不消耗 gas。这可以通过`meta_state`函数来实现。它获得`EscrowState`枚举，并以下面指定的`EscrowStateReply`枚举进行回复。

```rust
enum EscrowState {
    GetInfo(WalletId),
}
```

```rust
enum EscrowStateReply {
    Info(Account),
}
```

### Actions & events

**Action** 是一个枚举，它被发送给一个程序，并包含关于它应该做什么的信息。在成功处理 **Action** 后，程序会用 **Event** 枚举来回复，其中包含关于已处理的 **Action** 和其结果的信息。

```rust
enum EscrowAction {
    Create {
        buyer: ActorId,
        seller: ActorId,
        amount: u128,
    },
    Deposit(WalletId),
    Confirm(WalletId),
    Refund(WalletId),
    Cancel(WalletId),
}
```

```rust
enum EscrowEvent {
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
    Created(WalletId),
}
```

## 源码

Escrow 的合约源代码可以在 [GitHub](https://github.com/gear-dapps/escrow) 找到。

更多关于在 Gear 的测试智能合约的细节，请参考这篇文章：[应用测试](https://wiki.gear-tech.io/zh-cn/developing-contracts/testing/)。
