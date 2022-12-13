---
sidebar_label: Delayed Messages
sidebar_position: 8
---

# Delayed messages for smart contracts automation

To continue functioning, usual smart contracts on other blockchains require the help of external and centralized resources. They cannot auto-execute themselves. That means that their code will not run and make state changes on blockchain until triggered by an on-chain transaction.

The external transaction serves as a “poke” to wake the smart contract up and initiate its logic. For example, we can start the auction by sending a message to the auction contract. When the auction time has passed, it is necessary to process the result of the auction. However, the result will not be processed until someone sends an appropriate message to the contract.

Gear Protocol solves this via introducing delayed messaging functionality. The smart contracts in Gear Networks are able to execute themself **unlimited** number of blocks (provided that enough gas for execution is kept available). The [gas reservation](./gas-reservation.md) option allows you to ensure this. So the need of having centralized components for dApps eliminates, making them functioning **totally on-chain**.

```rust
msg::send_delayed(program, payload, value, delay)
msg::send_bytes_delayed(program, payload, value, delay)
```

The delayed message will be executed after the specified `delay` measured in blocks. For example, on a network with a block producing time of 2 seconds, a delay of 30 is equal to 1 minute.

Considering the example with auction, we can start the auction by sending a message to the auction contract. After completing all the necessary logic, the auction contract will send a delayed message to itself, which will settle the auction after the indicated time.
