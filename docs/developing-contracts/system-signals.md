---
sidebar_position: 8
---

# System signals

The Gear Protocol ensures system and program's state consistency via introducing special handling mechanisms for potential issues and corner cases.

Gear actors have three common entry points - `init`, `handle`, `handle_reply`. Another special system entry point introduced by the Gear Protocol is `handle_signal`. It allows the system to communicate with programs if it is necessary to notify (signal) that some event related to the program's messages has happened. Only the system (Gear node runtime) can send signal messages to a program.

First of all, it can be useful to free up resources occupied by the program. A custom async logic in Gear implies storing `Futures` in a program's memory. The execution context of `Futures` can occupy some significant amount of memory in case of many futures. When a program sends a message and waits for a reply to be waked, the reply can not be received. So there might be the case that if the initial message in the waitlist runs out of gas or the gas amount is not enough to properly finish the execution, the program’s state will be rolled back and `Future` will never be freed.

In this case, `Futures` remain in memory pages forever. Other messages are not aware about `Futures` associated with other messages. Over time, `Futures` accumulate in the program's memory so eventually a large amount of Futures limits the max amount of space the program can use.

In case a message has been removed from the waitlist due to gas constraints, the system sends a system message (signal) that is baked by an amount of **reserved gas**, which informs the program that it’s message was removed from the waitlist. Based on this info, a program can clean up its used system resources (`Futures`).

The `gstd` library provides a separate function for reserving gas specifically for system signal messages. It cannot be used for sending other regular cross-actor messages. 

If a signal message appears, it uses gas specifically reserved for such kinds of messages. If no gas has been reserved for system messages, they are just skipped and the program will not receive them.

If gas has been reserved but no system messages occur within some defined period (amount of blocks), then this gas returns back from where it was taken. The same relates to gas reserved for non-system messages - gas returns back after a defined number of blocks or by program’s command.

For programs written using the Gear Protocol's `gstd` library, such signals can be sent to programs automatically under the hood when applicable. If a smart contract developer implements a program using `gcore` or Gear's syscalls, then such signals should be considered in the program's code explicitly.
