---
title: Why do we Gear?
sidebar_position: 2
sidebar_label: Why do we build Gear?
---

## Global aspect

Blockchain technology launched a rapid transition from centralized, server-based internet (Web2) to a decentralized, distributed one - Web3. Its distinctive features are: no single point of failure (the network can still function even if a large proportion of participants are attacked/taken out), censorship resistance, anyone in the network has the possibility to use the service (permissionless).

Web3 introduces new types of decentralized applications (dApps) and assets such as: decentralized finances (DeFi), decentralized currency exchanges (DEX), decentralized marketplaces and gaming platforms, NFTs, Social Tokens and more.

Today the industry is still in its infancy, which provides opportunities for the rapid growth of Web3 and all-time high demand for Web3 developers, their activity is growing faster than ever.

Gear was built for the purpose of becoming an essential platform for building the Web3 ecosystem.

### Blockchains evolution

At their core, blockchains store a history of transactions between parties in a form that can be accessible by anybody. They ensure decentralized, immutable and premissionless access to data in the blcokchain.

Networks that were at the dawn of blockchain technology have a number of significant issues:

- Lack of scalability, low transaction speed, high transaction costs - all of it hinders the growth of applications in Web3
- Domain-specific development languages leads to high barrier to entry. The need to learn new programming language and paradigms holds back the growth of developers entering Web3
- Complex and inefficient native consensus protocols
- Absence of intercommunication between networks 


## Dotsama ecosystem (Polkadot/Kusama networks)

The solution has been found in Parity technologies focused on creating a Layer-0 technology that connects blockchains together into one big network - Polkadot.

Polkadot provides a system in which blockchains coexist and complement each other. Different parallel blockchains (parachains) are built on Substrate as well as Polkadot and connected to the relay chain and have a native connection.This allows for different nodes to run different application logic, keeping each chain on its own platform. All parachains are interconnected, creating a massive network of multifunctional blockchain services. Parachains compose the Layer-1 of the Polkadot ecosystem, the main difference in connection with other standalone Layer-1 blockchain networks like Ethereum, Bitcoin, Solana, etc. is that parachains are connected through Substrate Cumulus library and standalone blockchains through bridges.

Polkadot and its testnet Kusama are designed to be a fully extensible and scalable blockchain development, deployment and interaction test bed. It is built to be a largely future-proof harness able to assimilate new blockchain technology as it becomes available without over-complicated decentralized coordination or hard forks. 

Today Polkadot is one of the fastest-growing multi-chain networks. Although it has an adaptive architecture for building smart-contract platforms and rapid technology development for decentralized applications, it is not a smart contract platform by itself.

As a smart contract platform built on Substrate, Gear was built so that it can be used to deploy a Layer-1 parachain on Polkadot or Kusama, or a standalone network independent of Polkadot or Kusama, any of which being a “Gear Network”. A Gear Network enables developers to deploy their dApps in mere minutes in the easiest and most efficient way possible. This will enable developers to build dApps on Polkadot and Kusama to take advantage of the benefits of each unique network without the traditional significant time and financial expense associated with doing so.

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

## Gear role in the Polkadot network

As a Polkadot/Kusama parachain network, Gear Protocol-powered networks are intended for hosting Layer-2 smart contracts. This allows anyone to deploy any dApp on Polkadot and Kusama to take advantage of all the benefits of their ecosystems, yet at the minimal financial expense.

Like Polkadot, Gear Protocol uses a Substrate framework. This simplifies the creation of different blockchains for specific applications. Substrate provides extensive functionality out-of-the-box and allows one to focus on creating a custom engine on top of the protocol. Projects building on Gear Protocol can seamlessly integrate their solutions into the whole Polkadot/Kusama ecosystem.

The central aspect of Polkadot is its ability to route arbitrary messages between chains. Both Polkadot and Gear networks speak the same language — asynchronous messages — so all the projects built using Gear easily integrate into the Polkadot and Kusama networks. The asynchronous messaging architecture allows Gear networks to be an efficient and easy-to-use parachains.

The majority of developers and inspirers of Gear Protocol were directly involved in creating Polkadot and Substrate technologies. Gear is developing, taking into account the features of the architecture and design of its older brother. We rely on the high security and flexibility of our product, just like Polkadot.

Gear networks scale naturally as hardware improves as it utilizes all CPU cores. Anyone with a standard computer can run a Gear node today and always. With its shardable design, Gear networks can scale by deploying across multiple parachain slots and can be sharded as a standalone network for additional scalability.

For additional details, refer to [Gear Whitepaper](https://whitepaper.gear-tech.io/).
