---
sidebar_label: 'Actor model'
sidebar_position: 3
---

# Gear Actor model for communications

In the concurrent computing systems a "Message-passing communication" approach implies programs communication via messages exchanging. It has advantages over "Shared memory communication". Message passing is easier to understand than shared memory concurrency. It is usually considered a more robust, has better performance characteristics than shared memory. 

For inter-process communications, Gear uses the Actor model approach - one of the plenty mathematical theories describing message-passing systems. The popularity of the Actor model has increased and it has been used in many new programming languages. The principle of the Actor model is that programs never share any state and just exchange messages between each other.

In the Actor model, a system consists of simultaneously functioning objects that communicate with each other exclusively by messaging. While an ordinary Actor model does not guarantee a message ordering, Gear provides some additional guarantees that the order of messages between two particular programs is preserved. 

The Actor model guarantees:

- High scalability 
- Нigh fault tolerance 

## Actor

An Actor in the Actor model, is an atomic computational unit that can send and receive messages. In case of Gear, an actor is a program (smart-contract) or a user that sends messages to a program. Every actor has an internal private state and a mailbox. Communication is asynchronous, messages are popped out from the mailbox and allocated to message provessing streams where processed in cycles.

When an actor receives and processes a message, the response can be the following:

- Send a message to another actor
- Create another actor
- Change its own internal state

Actors are independent, they never share any state and just exchange messages with each other. 

Using the Actor model approach gives a way to implement Actor-based concurrency inside programs (smart-contracts) logic. It can utilize various language constructs for asynchronous programming (Futures and async-await in Rust).

## Async/await support

Unlike classes, actors allow only one task to access their mutable state at a time, which makes it safe for code in multiple tasks to interact with the same instance of an actor.

Asynchronous functions significantly streamline concurrency management, but they do not handle the possibility of deadlocks or state corruption. To avoid deadlocks or state corruption, async functions should avoid calling functions that may block their thread. To achieve it, they use an await expression.

Currently, the lack of normal support of async/await pattern in the typical smart contracts code brings a lot of problems for smart contract developers. Actually, achieving better control in a smart contract program flow is actually more or less possible by adding handmade functions (in Solidity smart contracts). But the problem with many functions in a contract is that one can easily get confused - which function can be called at which stage in the contract's lifetime.

Gear natively provides arbitrary async/await syntax for any programs. It greatly simplifies development and testing and reduces the likelihood of errors in smart contract development. Gear API also allows to use synchronous messages by simply not using await expression if the logic of the program requires it.
