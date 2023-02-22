---
sidebar_label: Mailbox
sidebar_position: 3
---

# Mailbox

当程序向用户发送消息时，这条消息会被放在用户的 mailbox 里。实际上，mailbox 是一个专门的存储器，用于保存从程序中收到的信息。

用户可以通过订阅 [`UserMessageSent`](https://docs.gear.rs/pallet_gear/pallet/enum.Event.html#variant.UserMessageSent) 事件来检测收到的信息

在使用 IDEA 网站时，应该进入 https://idea.gear-tech.io/mailbox。

:::note
一条信息在 mailbox 中是要收费的。因此，信息在 mailbox 中的存在时间是有限的。
:::

我们来探讨一下用户对 mailbox 信息的可能反应。

## 用户对信息进行回复

程序可以向用户发送一条信息，并等待回复。用户可以使用[`send_reply`](https://docs.gear.rs/pallet_gear/pallet/struct.Pallet.html#method.send_reply) extrinsic 来回复。与消息相关的余额被转移到用户的账户，信息被从 mailbox 中删除，而新的回复信息被添加到信息队列中。

## 用户从 mailbox 的信息中获取余额

如果 mailbox 中的消息具有关联的余额，则用户可以使用 [`claim_value`](https://docs.gear.rs/pallet_gear/pallet/struct.Pallet.html#method.claim_value) extrinsic 声明它。余额被转移到用户的帐户，消息从 mailbox 中删除。

## 用户忽略 mailbox 中的消息

一条消息在其 gas 限制内对 mailbox 中的每一个区块都要收费。如果消息没有明确的 gas 限制，则从源头的限制中借用 gas（例如，启动执行的行为者）。

当信息的 gas 耗尽时，信息将从 mailbox 中删除，并将相关转账金额转回给信息发送者。
