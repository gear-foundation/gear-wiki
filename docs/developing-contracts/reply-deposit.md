---
sidebar_label: Reply Deposit
sidebar_position: 11
---

# Reply deposit

When a program or user sends a reply to a message, it should provide gas for the reply handling. The user replies using [`gear.sendReply`](https://docs.gear.rs/pallet_gear/pallet/struct.Pallet.html#method.send_reply) extrinsic. The program uses the [`msg::reply`](https://docs.gear.rs/gstd/msg/fn.reply.html) or [`msg::reply_with_gas`](https://docs.gear.rs/gstd/msg/fn.reply_with_gas.html) function.

Sometimes, it is more convenient to provide gas for the reply handling in advance. For example, if the program sends a message to another program and waits for a reply, it can provide gas for the reply handling in advance. In this case, the program doesn't need to provide gas for the reply handling when it sends a reply.

To provide gas for the reply handling in advance, the program should use the [`exec::reply_deposit`](https://docs.gear.rs/gstd/exec/fn.reply_deposit.html) function:

```rust
let message_id =
    msg::send(msg::source(), b"Outgoing message", 0).expect("Failed to send message");
exec::reply_deposit(message_id, 1_000_000_000).expect("Error during reply deposit");

#[no_mangle]
extern "C" fn handle_reply() {
    // The reply handling will be paid with the deposited gas
}
```

The program can deposit gas when using the [`msg::send_for_reply`](https://docs.gear.rs/gstd/msg/fn.send_for_reply.html) function by setting the `reply_deposit` parameter. The `reply_deposit` parameter is the amount of gas that will be reserved for the reply handling. The `reply_deposit` parameter is optional. If the `reply_deposit` parameter is zero, the program should provide gas for the reply handling when it sends a reply.

```rust
let message_id = msg::send_for_reply(
    msg::source(),
    b"Outgoing message",
    0,
    1_000_000_000,
).expect("Failed to send message");

#[no_mangle]
extern "C" fn handle_reply() {
    // The reply handling will be paid with the deposited gas
}
```
