---
sidebar_label: System Signals
sidebar_position: 10
---

# System signals

The Gear Protocol ensures system and program's state consistency via introducing special handling mechanisms for potential issues and corner cases.

Gear actors have three common entry points - `init`, `handle`, `handle_reply`. Another special system entry point introduced by the Gear Protocol is `handle_signal`. It allows the system to communicate with programs if it is necessary to notify (signal) that some event related to the program's messages has happened. Only the system (Gear node runtime) can send signal messages to a program.

First of all, it can be useful to free up resources occupied by the program. A custom async logic in Gear implies storing `Futures` in a program's memory. The execution context of `Futures` can occupy some significant amount of memory in the case of many futures. When a program sends a message and waits for a reply to be woken, the reply can not be received. So there might be the case that if the initial message in the waitlist runs out of gas or the gas amount is not enough to properly finish the execution, the program’s state will be rolled back and `Future` will never be freed.

In this case, `Futures` remain in memory pages forever. Other messages are not aware of `Futures` associated with other messages. Over time, `Futures` accumulate in the program's memory so eventually a large amount of Futures limits the max amount of space the program can use.

In case a message has been removed from the waitlist due to gas constraints, the system sends a system message (signal) that is baked by an amount of [reserved gas](/developing-contracts/gas-reservation.md), which informs the program that it’s message was removed from the waitlist. Based on this info, a program can clean up its used system resources (`Futures`).

The `gstd` library provides a separate function for reserving gas specifically for system signal messages. It cannot be used for sending other regular cross-actor messages:
```rust
exec::system_reserve_gas(1_000_000_000).expect("Error during system gas reservation");
```

If a signal message appears, it uses gas specifically reserved for such kinds of messages. If no gas has been reserved for system messages, they are just skipped and the program will not receive them.

If gas has been reserved but no system messages occur during the current execution, then this gas returns back from where it was taken. The same relates to gas reserved for non-system messages - gas returns back after a defined number of blocks or by the program’s command.

It can be useful for a developer when writing communication between programs. Developer can define `my_handle_signal` function and implement some logic there. For example, `Program A` sent a message to `Program B`. `Program A` is waiting for a reply from `Program B` but `Program B` runs out of gas. The current execution will be interrupted, but the system will send a signal to `Program A` and indicates the message identifier during which the execution was interrupted.
So, `Program A` sends a message and saves the message identifier:

```rust
exec::system_reserve_gas(2_000_000_000).expect("Error during system gas reservation");
let result = msg::send_for_reply(address, payload, value, reply_deposit);

let (msg_id, msg_future) = if let Ok(msg_future) = result {
    (msg_future.waiting_reply_to, msg_future)
} else {
    // handle the error here
};

// save the `msg_id` in program state
unsafe { STATE.msg_id == msg::id() };

let reply = msg_future.await;
```
The execution fails in `Program B`, and `Program A` receives a signal:
```rust
#[no_mangle]
extern "C" fn my_handle_signal() {
    if unsafe { STATE.msg_id == msg::signal_from() } {
        // write logic here
    }
}
```
However, it is important to understand that the execution of `my_handle_signal` should not be long and should not consume a lot of gas. It can be used for tracking failures during the transaction. The program can use the information about failures the next time it is executed.

For programs written using the Gear Protocol's `gstd` library, such signals can be sent to programs automatically under the hood when applicable. If a smart contract developer implements a program using `gcore` or Gear's syscalls, then such signals should be considered in the program's code explicitly.
