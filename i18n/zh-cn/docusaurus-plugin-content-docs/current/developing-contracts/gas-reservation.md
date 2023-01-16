---
sidebar_position: 7
---

# Gas 预留

Gas 预留是 Gear 协议的强大功能，它为智能合约编程和现代[用例](../gear/distinctive-features)提供了新方法。

简单地说，程序可以使用之前预留的 gas 来发送消息，而不是使用当前处理的消息中的 gas。

这个功能的关键优势是能够自动向网络中的任何参与者--用户或另一个智能合约以及**本身** -- 发送[延迟消息](./delayed-messages.md)。事实上，一个程序能够自己执行**无限的**块（只要保持足够的 gas 即可）。

开发者可以在程序的代码中提供一个特殊的函数，从这个程序的可用量中获取一定数量的 gas，并将其保留。预留得到一个唯一的标识符，可以被程序用来获取这个预留的 gas 并在以后使用。
要保留 gas 的数量以便进一步使用，请使用以下函数：
```rust
let reservation_id = ReservationId::reserve(RESERVATION_AMOUNT, TIME)
                                    .expect("reservation across executions");
```

还必须说明在哪个区块内使用该预留的 gas。gas 预留不是免费的：预留一个区块需要 100 个 gas。`reserve` 函数返回`ReservationId`，它可以用来发送带有该 gas 的消息。使用预留 gas 发送消息：
```rust
msg::send_from_reservation(reservation_id, program, payload, value)
                                .expect("Failed to send message from reservation");
```

如果在预留时规定的时间内不需要 gas，可以取消预留，gas 将被退回给预订的用户。
```rust
id.unreserve().expect("unreservation across executions");
```

程序可以有不同的执行方式，改变状态并以某种方式进行评估，但当有必要时，程序可以用这个预留的 gas 发送消息，而不是使用自己的 gas。

例如，让我们考虑完全在链上工作的游戏。玩家是智能合约，通过实施各种游戏策略相互竞争。通常，在这些类型的游戏中，有一个主合约来启动游戏并控制玩家之间的移动顺序。为了开始游戏，有人向合约发送一条信息。这个信息所附带的 gas 被花在玩家的合约上，而这些合约又花在它们的执行上。由于游戏可以持续相当多的回合，所附带的 gas 可能不足以完成游戏。你可以发送消息要求程序继续游戏，或者你可以使用 gas 预留并进行全自动游戏。使用 gas  预留，合约将能够不间断地举行比赛。
