---
sidebar_label: Actor Model
sidebar_position: 2
---

# Actor Model

One of the key and distinguished features of Gear Protocol is the **Actor model** for message-passing communications.

Actor model framework enables asynchronous messaging and parallel computation which drastically increases the achievable speed and allows building more complex dApps in an easier way. Asynchronous format of dApps written on Gear Protocol makes them cross-chain compatible by default.

In concurrent computing systems, “message-passing communication” means that programs communicate by exchanging messages. This has its advantages over “shared memory communication” as message passing is easier to understand than shared memory concurrency as it’s more robust and has better performance characteristics.

For inter-process communications, Gear Protocol uses the Actor model approach. The principle of the Actor model approach is that programs never share any state and just exchange messages between each other.

With the Actor model, systems consist of simultaneously functioning objects that communicate with each other exclusively by messaging. While an ordinary Actor model does not guarantee message ordering, Gear Protocol provides some additional guarantees that the order of messages between two particular programs is preserved.

Actors are isolated from each other and do not share their memory. They have a state and the only way to change it is by receiving a message. 

The Actor model guarantees high scalability and high fault tolerance.

## Actor

An Actor in the Actor model is an atomic computational unit that can send and receive messages. With Gear, any instance in Gear Protocol is an Actor - a program (smart contract) or a user that sends messages to a program. Every Actor has an internal private state, also users have a mailbox. Communication is asynchronous, messages are popped out from the mailbox and allocated to message processing streams where they’re then processed in cycles.

When an actor receives and processes a message, the response can be the following:

 - Send a message to another actor
 - Create another actor
 - Change its own internal state

Actors are independent, they never share any state and just exchange messages with each other.

Using the Actor model approach provides a way to implement Actor-based concurrency inside smart contract logic. It can utilize various language constructs for asynchronous programming (Futures and async-await in Rust).

## Async/await support

Unlike classes, Actors allow only one task to access their mutable state at a time, which makes it safe for code in multiple tasks to interact with the same instance of an actor.

Asynchronous functions significantly streamline concurrency management, but they do not handle the possibility of deadlocks or state corruption. To avoid deadlocks or state corruption, async functions should avoid calling functions that may block their thread. To achieve it, they use an await expression.

Currently, the lack of normal support of async/await patterns in the typical smart contracts code brings a lot of problems for smart contract developers. Actually, achieving better control in a smart contract program flow is actually more or less possible by adding handmade functions (like in Solidity smart contracts). But the problem with many functions in a contract is that one can easily get confused - which function can be called at which stage in the contract's lifetime. It brings unnecessary complexity for developers writting smart contracts using domain specific languages.

Gear natively provides arbitrary async/await syntax for any programs. It greatly simplifies development and testing and reduces the likelihood of errors in smart contract development. Gear Protocol's API also allows synchronous messages by simply not using await expression if the logic of the program requires it.
