---
sidebar_label: Built-in Actors
sidebar_position: 1
---

# Built-in Actors

## Overview

The Built-in Actors framework is an extensible system that provides a registry of built-in actors available in the Gear node runtime. Built-in Actors are programs (but not a Wasm programs) implemented as a runtime [pallet](https://github.com/gear-tech/gear/tree/master/pallets/gear-builtin) capable of handling messages from other actors (programs) and process them in applications built on top of blockchain logic (such as staking, governance, computationally intensive calculations and more). This framework allows for the integration of custom logic, including access to the node's operating system and native execution.

Built-in Actors may be added, removed, updated (including address change) by the Gear Protocol's development team during runtime upgrades. If a new runtime interface added with a Built-in Actor, upgrading the node client is essential to import blocks and maintain onchain functionality.

:::note
Built-in Actors can be added by the developers of the Gear Protocol, as they are part of the runtime. They cannot be created by any other program or initiated by users. However, they are accessible to everyone like any other program through messaging.
:::

## Usage

Built-in actors each have a unique `BuiltinId`. These IDs can be used by other programs to send specifically formatted messages to perform actions related to the blockchain logic implemented in the `Runtime`. `BuiltinId` is like an index of BIA, and with special RPC call it can be converted into the `ProgramId` to get trusted and valid program id from on-chain.

A set of unique `BuiltinActor`s is defined in the `pallet_gear_builtin_actor::Config` trait as an associated type — a tuple consisting of custom types, each of which must implement the `pallet_gear_builtin::BuiltinActor` trait (similar to how migrations or signed extras are defined in the Runtime). These can be pallets (if access to on-chain storage is required) or any other custom types.

When the next message is dequeued, a runtime checks the destination. If it is BIA, the runtime calls the respective BIA with the messages. Otherwise, it searches the storage for the Wasm program by address and executes it. The functionality of routing to a specific built-in actor instead of stored programs is provided by the `gear_builtin` pallet. To achieve this, the actor is automatically registered with the `pallet_gear::Config::<T>::BuiltinRouter` associated type that implements the `pallet_gear::builtin::BuiltinRouter` trait and provides the `lookup()` function. This function is used to derive the respective `BuiltinId` based on the message's destination address (`ProgramId`).
