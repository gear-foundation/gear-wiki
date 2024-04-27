---
sidebar_label: Built-in Actors
sidebar_position: 1
---

# Built-in Actors

## Overview

The Built-in Actors framework is an extensible system that provides a registry of built-in actors available in the Gear node runtime. It is implemented as a runtime [pallet](https://github.com/gear-tech/gear/tree/master/pallets/gear-builtin) capable of handling messages from other actors (programs) and process them in applications built on top of blockchain logic (such as staking, governance, computationally intensive calculations and more). This framework allows for the integration of custom logic, including access to the node's operating system and native execution.

New Built-in Actors may be added during runtime upgrades. Since the calculations for Built-in Actors are performed within the runtime interface of the node, upgrading the node client is essential to import blocks and maintain onchain functionality.

:::note
Built-in Actors can be added by the developers of the Gear Protocol, as they are part of the runtime. They cannot be created by any other program or initiated by users. However, they are accessible to everyone like any other program through messaging.
:::

## Usage

Built-in actors each have a unique `BuiltinId`, similar to other actor addresses in the network (like `ProgramId`). These IDs can be used by other programs to send specifically formatted messages to perform actions related to the blockchain logic implemented in the `Runtime`.

A set of unique `BuiltinActor`s is defined in the `pallet_gear_builtin_actor::Config` trait as an associated type — a tuple consisting of custom types, each of which must implement the `pallet_gear_builtin_actor::BuiltinActor` trait (similar to how migrations or signed extras are defined in the Runtime). These can be pallets (if access to on-chain storage is required) or any other custom types.

The functionality provided by the `gear_builtin` pallet includes message routing to a specific built-in actor instead of stored programs. To achieve this, the actor must be registered with the `pallet_gear::Config::<T>::BuiltinRouter` associated type that implements the `pallet_gear::builtin::BuiltinRouter` trait and provides the `lookup()` function. This function is used to derive the respective `BuiltinId` based on the message's destination address (`ProgramId`).
