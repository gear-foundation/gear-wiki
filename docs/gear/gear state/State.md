---
sidebar_position: 1
sidebar_label: 'State components'
---

# State components

As any blockchain system, Gear maintains distributed state. Runtime code compiled to WebAssembly becomes part of the blockchain’s storage state. 

Gear ensures one of the defining features - **forkless runtime upgrades**. The state is also guaranteed to be finalized if finality gadget is used.

Storage state consists of the following components:

- **Programs and memory** (includes program’s code and private memory)
- **Message queue** (global message queue of the network)
- **Accounts** (network accounts and their balances)

### Programs

Programs are first-class citizens in the Gear network state.

Program code is stored as an immutable Wasm blob. Each program has a fixed amount of memory which persists between message-handling (so-called static area).

Programs can allocate more memory from the memory pool provided by a Gear instance. A particular program can read and write only within exclusively allocated to it memory.

### Memory

Gear instance holds individual memory space per program and guarantees it's persistence. A program can read and write only within its own memory space and has no access to the memory space of other programs. Individual memory space is reserved for a program during its initialization and does not require additional fee (included in the program initialization fee). 

A program can allocate the required amount of memory in blocks of 64KB. Each memory block allocation requires gas fee. Each page (64KB) is stored separately on the distributed database backend, but at the run time, Gear node constructs continuous runtime memory and allows programs to run on it without reloads.

### Message queue

Gear instance holds a global message queue. Using Gear node, users can send transactions with one or several messages to a particular program(s). This fills up the message queue. During block construction, messages are dequeued and routed to the particular program.

### Accounts

For a public network, protection against DOS attacks always requires gas/fee for transaction processing. Gear provides a balance module that allows to store user and program balances and pay a transaction fee.

In general, a particular Gear network instance can be defined as both permissioned and permissionless, public blockchain. In the permissioned scenario, no balance module is required.
