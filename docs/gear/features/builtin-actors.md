---
sidebar_label: Built-in Actors
sidebar_position: 4
---

# Built-in Actors

## Overview
[Built-In Actors](/docs/developing-contracts/builtinactors/builtinactors.md) are specialized entities within the Gear runtime that execute specific business logic when programs communicate with them via messages. This feature addresses a critical limitation: while users can directly interact with pallets through extrinsics like `bond`, `nominate`, `vote`, etc., programs within the Gear Protocol can only send messages, not extrinsics.

## Purpose and Operation of BIAs

Generally, BIAs are essential for enabling programs on the blockchain (i.e., smart contracts) to access and utilize the functionalities of pallets. 

Managed by the protocol, BIAs share the same interface similar to other programs, primarily using messaging. However, unlike programs loaded onto the network, Built-In Actors are introduced and updated through runtime upgrades, maintaining synchronization with the network's evolution.

## Applications of Built-In Actors

### Accessing Pallet Functions

BIAs allow programs to interact with existing Substrate pallets and others (like staking or proxy pallets). For example, a program can send a BIA a message to `bond` a certain amount or `nominate` a validator, and the BIA will execute these on behalf of the program.

**Examples:**
- DAO members might pool funds in a program that uses a BIA to stake these funds. The staking rewards are then distributed weekly among the participants.
- In a play-to-earn game, a user could set up a program to automatically stake earned assets or transfer rewards to an external address or within the game's balance.
- For users with zero balance, a program could use a special BIA to issue vouchers from the program’s funds without needing external services. This bypasses the limitation where such actions could only be funded by the user’s own resources.
- A special BIA could grant programs access to a proxy pallet, allowing various programs to perform limited authorized operations on behalf of the proxied program.

This provides dApp developers with a powerful mechanism for automating scenarios and implementing custom logic in programs. For instance, BIAs provides acceess to the `staking` pallet for programs, facilitating the creation of automated staking.

### Intensive Computations
BIAs offload intensive computational tasks from the programs, efficiently handling them at the node level to minimize gas costs and execution time. This is crucial for operations that exceed the gas limit of a single block or require extensive computational resources, such as cryptographic verifications or neural network tasks.
- For instance, cryptographic computations like BLS signature verification. BIAs designed for such computations perform them efficiently and cost-effectively at the node level.
- Simple operations like SHA-256 hashing are executed much faster through a BIA than in an on-chain program.
- BIAs can also manage neural network operations, image generation, and pattern recognition from program inputs.

### BIA as Cross-Chain Bridge

A BIA pallet can implement a cross-chain bridge logic that receives messages from programs, queues them, and sends them to another network based on specific logic. After execution on the other side, the program receives a response indicating the success or failure of the operation. This eliminates the need for custom intermediary nodes or teleport programs.

The BIA can also be used to accelerate primitives for verifying ZK proofs through ECC (Elliptic Curve Cryptography), performing these calculations efficiently at the node level because they are too intensive for on-chain execution within gas limits.

### Arbitrary Storage
If a dApp developer prefers not to write data directly into the on-chain program's memory, a BIA can serve as an efficient storage solution.

## Conclusion
BIAs elevate the capabilities of programs (smart contracts) to the user level. Features typically implemented through pallets and accessible only through extrinsics are now available to programs. This includes using balances for governance voting, issuing vouchers, allowing other actors to perform operations on behalf of the program (proxying), conducting complex computations, and much more. This expansion significantly enhances the functionality and potential applications of blockchain programs.