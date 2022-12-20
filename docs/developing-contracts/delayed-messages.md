---
sidebar_label: Delayed Messages
sidebar_position: 8
---

# Delayed messages for smart contracts automation

The usual way that smart contracts on other blockchains continue to function is by relying on external, centralized resources. This means that the code of these contracts will not run and make changes to the blockchain's state until it is triggered by an on-chain transaction.

The external transaction serves as a "poke" to activate the smart contract and initiate its logic. For instance, we can start an auction by sending a message to the auction contract. When the auction time has passed, the contract will need to process the result of the auction. However, this will not happen until someone sends the appropriate message to the contract to trigger this action.

Gear Protocol solves this issue by introducing delayed messaging functionality. The smart contracts in Gear Networks are able to execute themselves an **unlimited** number of blocks, as long as enough gas for execution is kept available. The [gas reservation](./gas-reservation.md) option allows you to ensure this. As a result the need for including centralized components in dApps is eliminated, allowing them to function **totally on-chain**.

```rust
msg::send_delayed(program, payload, value, delay)
msg::send_bytes_delayed(program, payload, value, delay)
```

The delayed message will be executed after the specified `delay` measured in blocks. For example, on a network with a block producing time of 2 seconds, a delay of 30 is equal to 1 minute.

Considering the example with auction, we can start the auction by sending a message to the auction contract. After completing all the necessary logic, the auction contract will send a delayed message to itself, which will settle the auction after the indicated time.
