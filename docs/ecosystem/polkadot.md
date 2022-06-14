---
sidebar_position: 1
sidebar_label: Polkadot
---

# Polkadot network

Polkadot is a blockchain protocol that connects specific blockchains into one single multinetwork and provides a high level of interoperability and security.

Today Polkadot is one of the fastest-growing multi-chain networks. Although it has an adaptive architecture for building smart-contract platforms and rapid technology development for decentralized applications, it is not a smart contract platform by itself.

There are several components in the Polkadot architecture, namely:

 - Relay Chain
 - Parachains
 - Bridges

### Relay Chain

Relay Chain is the heart of Polkadot, responsible for the network’s security, consensus and cross-chain interoperability. It allows specialized blockchains and public blockchains to connect within the unified and interoperable Polkadot network. Relay Chain can be understood as a Layer-0 platform.

The Relay Chain has minimal functionality, which naturally means that advanced functionality features, like smart contracts for example, are not supported. Other specific work is delegated to the parachains, which each have different implementations and features.

The main task of the Relay Chain is to coordinate the overall system and its connected parachains to build a scalable and interoperable network.

It’s also the Relay Chain that is responsible for the network’s shared security, consensus and cross-chain interoperability.

### Parachains

Parachains are sovereign blockchains that can have their own tokens and optimize their functionality for specific use cases.

Parachains must be connected to the Relay Chain to ensure interoperability with other networks. For this, parachains lease a slot for continuous connectivity or they can pay as they go (in this case they are called Parathreads). Parachains compose the Layer-2 of the Polkadot ecosystem.

Parachains are validateable by validators of the Relay Chain and they get their name from the concept of paralleziable chains that run parallel to the main Relay Chain. Due to their parallel nature, they are able to parallelize transaction processing which helps improve scalability of the Polkadot network.

Parachains optimize their functionality for specific use cases and, in many instances, support their own tokens.

In order to become a parachain on Polkadot and Kusama, projects have to participate in a [parachain auction](https://parachains.info/auctions).

### Bridges

A blockchain bridge is a special connection that allows the Polkadot ecosystem to connect to and communicate with external networks like Ethereum, Bitcoin and others. Such networks can be considered as Layer-1. Bridge connection allows transfer of tokens or arbitrary data from one blockchain to another.

### Gear role in the Polkadot network

As a Polkadot/Kusama parachain network, Gear is intended to be a tool for hosting Layer-2 smart contracts. This allows anyone to deploy any dApp on Polkadot and Kusama to take advantage of all the benefits of their ecosystems, yet at the minimal financial expense.

Like Polkadot, Gear uses a Substrate framework. This simplifies the creation of different blockchains for specific applications. Substrate provides extensive functionality out-of-the-box and allows one to focus on creating a custom engine on top of the protocol.

The central aspect of Polkadot is its ability to route arbitrary messages between chains. Both Polkadot and Gear networks speak the same language — asynchronous messages — so all the projects built using Gear easily integrate into the Polkadot and Kusama networks. The asynchronous messaging architecture allows Gear to be an efficient and easy-to-use parachain.

Projects building on Gear can seamlessly integrate their solutions into the whole Polkadot/Kusama ecosystem.

The majority of developers and inspirers of Gear were directly involved in creating Polkadot and Substrate technologies. Gear is developing, taking into account the features of the architecture and design of its older brother. We rely on the high security and flexibility of our product, just like Polkadot.
