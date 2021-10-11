---
sidebar_position: 0
sidebar_label: 'Оverview'
---

# Introduction

The critical aspect of Polkadot network is its ability to route arbitrary messages between chains. Using these messages is as simple as it can be: negotiate the channel between two parachains and send asynchronous messages through it.

Polkadot Relay Chain and Gear ultimately speak the same language (asynchronous messages). The asynchronous messaging architecture allows Gear to be an effective and easy-to-use parachain of Polkadot network:

 - Users deploy programs to Gear network.
 - Individual channels are established to popular parachains or bridges (there can be many and competing).
 - The whole Gear parachain communicates through them.
 - Such architecture allows driving the transition of the network between states and fits nicely to the whole network.
