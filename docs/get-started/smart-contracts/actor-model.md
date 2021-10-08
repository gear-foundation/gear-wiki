---
sidebar_label: 'Actor model'
sidebar_position: 0
---

# Gear Actor model

Gear is based on the actor model communication. In short, the actor model as a system consists of simultaneously functioning objects communication between them occurs exclusively by messaging.

## Actor

The Actor is the atomic unit of the actor model (in the case of Gear its program). It is a computational unit that can send and receive messages. Every actor has an internal private state and a mailbox. When an actor gets and compute a message, it can react in 3 ways:

- Send a message to another actor
- Change its internal state
- Create another actor

Communication is asynchronous; messages are popped out from the mailbox and processed in series. 

The Actor model guarantees:

- High scalability 

- Нigh fault tolerance 

The Actors are independent. Programs never share any state and just exchange messages with each other. Meanwhile, an ordinary actor model does not guarantee a message ordering. Gear provides some additional guarantees that the order of messages between two particular programs is preserved. 

Using the Actor model approach gives a way to implement Actor-based concurrency inside programs (smart-contracts) logic. It can utilize various language constructs for asynchronous programming (Futures and async-await in Rust).