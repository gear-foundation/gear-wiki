---
sidebar_position: 0
sidebar_label: 'Оverview'
---

# Introduction

Gear uses the Substrate framework under the hood. It covers the most desired requirements for enterprise-ready decentralized projects - fault tolerance, replication, tokenization, immutability, data security and production-ready cross-platform persistent database.

Substrate is a modular framework that allows to create custom-built blockchains with consensus mechanism, core functionality and security out of the box.

Substrate is an important component of the Polkadot network. It allows every team creating a new blockchain not to waste efforts for implementation of the networking and consensus code from scratch.
Refer to [Substrate Documentation](https://substrate.dev/docs/en/) for more details.

Polkadot is a next-generation blockchain protocol intended to unite multiple purpose-built blockchains, allowing them to operate seamlessly together at scale. The critical aspect of the Polkadot network is its ability to route arbitrary messages between chains. These messages enable negotiation channel between two parachains and allow sending asynchronous messages through it.

Using Substrate allows to quickly connect Gear instances as a parachain/parathread into the Polkadot/Kusama network.

Polkadot Relay Chain and Gear ultimately speak the same language (asynchronous messages). The asynchronous messaging architecture allows Gear to be an effective and easy-to-use parachain of Polkadot network:

 - Users deploy programs to the Gear network.
 - Individual channels are established to popular parachains or bridges (there can be many and competing).
 - The whole Gear parachain communicates through them.
 - Such architecture allows driving the transition of the network between states and fits nicely to the whole network.
