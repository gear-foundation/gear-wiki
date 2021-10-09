---
sidebar_label: 'Actor model'
sidebar_position: 0
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
