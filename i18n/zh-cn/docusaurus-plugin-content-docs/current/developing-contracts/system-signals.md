---
sidebar_label: 系统信号
sidebar_position: 10
---

# 系统信号

Gear Protocol 通过为可能存在的问题和极端情况引入了特殊的处理机制，确保系统和程序的状态一致性。

Gear actor 有三个常见的入口点 —— `init`，`handle`，`handle_reply`。Gear Protocol 引入的另一个特殊的系统入口点是`handle_signal`。如果需要通知（发送信号）与程序信息相关的事件已经发生，它允许系统与程序通信。只有系统 (Gear 节点运行时) 才能向程序发送信号消息。

首先，它对释放程序占用的资源很有帮助。在 Gear 中，自定义异步逻辑意味着将 `Futures` 存储在程序的内存中。在许多情况下，`Futures`的执行上下文可能会占用大量的内存。当程序发送消息并等待应答被唤醒时，无法接收应答。因此，可能会出现这样的情况：如果等待列表中的初始消息耗尽了 gas，或者 gas 数量不足以正确完成执行，程序的状态将回滚，`Future` 将永远不会被释放。

在这种情况下，`Futures`会永远保留在内存页中。其他消息不知道与其他消息相关的 `Futures` 。随着时间的推移，`Futures`在程序的内存中不断积累，最终大量的 `Futures` 限制了程序可以使用的最大内存空间。

如果一个消息由于 gas 限制，从而在等待列表中删除，系统会发送一个系统消息（信号），该消息由[预留 gas](/developing-contracts/gas-reservation.md)发出，通知程序，其消息已经从等待列表中删除。基于这个信息，程序可以清理它所使用的系统资源。基于这一信息，程序可以清理其使用的系统资源（`Futures`）。

`gstd` 库提供了一个单独的函数，专门为系统信号信息预留 gas。它不能用于发送其他常规的跨 actor 信息：

```rust
exec::system_reserve_gas(1_000_000_000).expect("Error during system gas reservation");
```

如果出现一个信号信息，它就会使用专门为这类信息预留的 gas。如果没有为系统信息预留 gas，信号就会被跳过，程序不会收到它们。

如果已经预留了 gas，但在当前的执行过程中没有发生系统消息，那么这个 gas 就会从原处返回。同样的，为非系统消息保留的 gas 也是如此--gas 在规定的区块数量后或由程序的命令返回。

在编写程序之间的通信时，它对开发者来说是很有用的。开发者可以定义 `my_handle_signal` 函数并实现一些逻辑。举个例子，`Program A` 向 `Program B` 发送信息。`Program A` 正在等待 `Program B` 的回复，但 `Program B` 没有了 gas。
当前的执行将被中断，但系统将向 `Program A` 发送一个信号，并指出执行被中断时的消息标识符。
因此，`Program A` 发送了一条信息并保存了信息标识符：

```rust
exec::system_reserve_gas(2_000_000_000).expect("Error during system gas reservation");
let result = msg::send_for_reply(address, payload, value);

let (msg_id, msg_future) = if let Ok(msg_future) = result {
    (msg_future.waiting_reply_to, msg_future)
} else {
    // handle the error here
};

// save the `msg_id` in program state
unsafe { STATE.msg_id == msg::id() };

let reply = msg_future.await;
```

`Program B` 执行失败，`Program A` 收到一个信号：

```rust
#[no_mangle]
extern "C" fn my_handle_signal() {
    if unsafe { STATE.msg_id == msg::signal_from() } {
        // write logic here
    }
}
```

然而，需要了解的是，`my_handle_signal` 的执行时间不可以很长，不应该消耗大量的 gas。它可以用于跟踪交易过程中的失败。程序可以在下次执行时使用失败的信息。

对于使用 Gear Protocol 的 `gstd` 库编写的程序，这种信号可以在适用的情况下自动发送给程序。如果智能合约开发者使用`gcore`或 Gear 的系统调用实现了一个程序，那么这些信号应该在程序代码中明确地考虑。
