---
sidebar_label: 多签钱包
sidebar_position: 11
---

# 多签钱包

## 介绍

多签名钱包是一种加密货币钱包，需要一个或多个私钥来签署和发送交易。

想象一下，一个银行金库需要不止一把钥匙才能打开：这就是多重签名钱包的工作原理。

多重签名的支持者认为，多重签名是存储加密货币最安全、最不会出错的方式。例如，即使小偷拿到了你的一个钱包，如果没有设置中其他钱包的密钥，他们仍然无法访问你的帐户。

## 业务逻辑

钱包由一个或多个所有者所有，如果有一些重要的操作，需要一定数量的所有者确认这个操作。

合约的部署者可以选择允许多少所有者从钱包发送交易以及发送交易所需的最少所有者数量 (比如：你可以有一个 2-3 的多重签名，其中需要三分之二的私钥，还有 3-5 签名、5-7 签名等)。

要通过多重签名发送交易，其中一位所有者应在有效负载中使用 `SubmitTransaction` 操作将交易发送到钱包，其他所有者应通过 `ConfirmTransaction` 操作批准此交易，直到达到所需数量。

在交易的描述中，所有者可以添加一些关于交易的有用信息。

这个钱包很灵活，用户可以管理所有者的名单和所需的确认数量。

> 当然，我们注意到了合约的安全性，所以增加、删除、替换一个所有者和改变所需的确认数，只能在其他所有者的要求确认下进行。

例如，交易审批逻辑很复杂：

1. 如果所有者提交了交易，而合约只需要一次确认就可以执行交易，那么合约将首先把交易添加到仓库保存，然后由提交所有者确认，再自动执行交易。

2. 如果所有者提交交易，而合约需要两个或更多的确认来执行交易，合约将首先把交易添加到仓库保存，然后由所有者确认。而要执行这个交易，钱包将需要一个或多个确认。然后，另一个所有者发送 `ConfirmTransaction` 操作给合约，如果一切正常，交易将被自动执行。

> 在大多数情况下，交易将在所有确认完成后自动执行。但有一种情况，如果交易被确认了`n`次，而合约需要`n + 1`次或更多的确认，然后所有者将所需的确认次数改为`n`次或更少，所有者可以等待下一次确认，或简单地调用 `ExecuteTransaction` 与相应的交易 ID 来执行它。

## 接口

### 初始配置
```rust
pub struct MWInitConfig {
    pub owners: Vec<ActorId>,
    pub required: u64,
}
```

描述了钱包的初始状态。
- `owners` - 一个新钱包的所有者列表
- `required` - 批准和执行交易所需的确认数

### Actions

```rust
pub enum MWAction {
    AddOwner(ActorId),
    RemoveOwner(ActorId),
    ReplaceOwner {
        old_owner: ActorId,
        new_owner: ActorId,
    },
    ChangeRequiredConfirmationsCount(u64),
    SubmitTransaction {
        destination: ActorId,
        data: Vec<u8>,
        value: u128,
        description: Option<String>
    },
    ConfirmTransaction(U256),
    RevokeConfirmation(U256),
    ExecuteTransaction(U256),
}
```

- `AddOwner` 添加新所有者的操作。必须通过`SubmitTransaction`来使用。
- `RemoveOwner` 删除所有者的操作。必须通过`SubmitTransaction`来使用。
- `ReplaceOwner` 用新所有者替换所有者的操作。必须通过`SubmitTransaction`来使用。
- `ChangeRequiredConfirmationsCount`是一个改变所需确认数量的操作。该操作必须通过 `SubmitTransaction` 来使用。
- `SubmitTransaction` 允许所有者提交并自动确认交易的操作。
- `ConfirmTransaction` 允许所有者确认交易的操作。如果这是最后一次确认，交易会自动执行。
- `RevokeConfirmation` 允许所有者撤销交易确认的操作。
- `ExecuteTransaction` 允许任何人执行确认交易的操作。

### Events

```rust
pub enum MWEvent {
    Confirmation {
        sender: ActorId,
        transaction_id: U256,
    },
    Revocation {
        sender: ActorId,
        transaction_id: U256,
    },
    Submission {
        transaction_id: U256,
    },
    Execution {
        transaction_id: U256,
    },
    OwnerAddition {
        owner: ActorId,
    },
    OwnerRemoval {
        owner: ActorId,
    },
    OwnerReplace {
        old_owner: ActorId,
        new_owner: ActorId,
    },
    RequirementChange(U256),
}
```

- `Confirmation` 当有人成功使用 `ConfirmTransaction` 操作时发生的事件
- `Revocation` 当有人成功使用 `RevokeConfirmation` 操作时发生。
-  `Submission` 当有人成功使用 `SubmitTransaction` 操作时发生。
- `OwnerAddition` 当钱包成功使用 `AddOwner` 操作时发生。
- `OwnerRemoval` 当钱包成功使用 `RemoveOwner` 操作时发生。
- `OwnerReplace` 当钱包成功使用 `ReplaceOwner` 操作时发生。
- `RequirementChange` 当钱包成功使用`ChangeRequiredConfirmationsCount` 操作时发生。

### State

*请求：*

```rust
pub enum State {
    ConfirmationsCount(U256),
    TransactionsCount {
        pending: bool,
        executed: bool,
    },
    Owners,
    Confirmations(U256),
    TransactionIds {
        from_index: u64,
        to_index: u64,
        pending: bool,
        executed: bool,
    },
    IsConfirmed(U256),
    Description(U256)
}
```

- `ConfirmationsCount` 返回交易的确认数量。
- `TransactionsCount` 返回应用申报者后的交易总数。`pending` 包括尚未执行的交易，`executed` 包括已完成的交易。
- `Owners` 返回所有者的列表。
- `Confirmations` 返回拥有者地址的数组，其中确认交易的 ID 是一个参数。
- `TransactionIds` 返回定义范围内的交易 ID 列表。
  - `from` 索引起始位置。
  - `to` 索引结束位置（不包括此位置）。
  - `pending` 包括尚未执行的交易。
  - `executed` 包括已执行的交易。

- `IsConfirmed` 返回 ID 为参数的交易的确认状态。
- `Description` 返回 ID 为参数的交易的描述。

每个状态请求都有一个对应的同名回复。

*消息回复：*

```rust
pub enum StateReply {
    ConfirmationCount(u64),
    TransactionsCount(u64),
    Owners(Vec<ActorId>),
    Confirmations(Vec<ActorId>),
    TransactionIds(Vec<U256>),
    IsConfirmed(bool),
    Description(Option<String>)
}
```

## 源码

多签钱包的例子的源代码和其测试的实例源码在 [GitHub](https://github.com/gear-foundation/dapps-multisig-wallet)。

同样可以找到基于 `gtest` 实现的智能合约测试范例：[multisig-wallet/tests](https://github.com/gear-foundation/dapps-multisig-wallet/tree/master/tests)。

更多关于在 Gear 上测试智能合约的细节，请参考这篇文章：[应用测试](/developing-contracts/testing)。
