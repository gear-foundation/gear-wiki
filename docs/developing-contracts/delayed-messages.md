---
sidebar_label: Delayed Messages
sidebar_position: 9
---

# Delayed messages for programs automation

The usual way that smart contracts on other blockchains continue to function is by relying on external, centralized resources. This means that the code of these contracts will not run and make changes to the blockchain's state until it is triggered by an on-chain transaction.

The external transaction serves as a "poke" to activate the smart contract and initiate its logic. For instance, someone can start an auction by sending a message to the auction contract. When the auction time has passed, the contract will need to process the result of the auction. However, this will not happen until someone sends the appropriate message to the contract to trigger this action.

Gear Protocol solves this issue by introducing delayed messaging functionality. The programs in Gear Networks are able to execute themselves an **unlimited** number of blocks, as long as enough gas for execution is kept available. The [gas reservation](./gas-reservation.md) option allows you to ensure this. As a result the need for including centralized components in dApps is eliminated, allowing them to function **totally on-chain**.

[`msg::send_delayed`](https://docs.gear.rs/gstd/msg/fn.send_delayed.html) function allows sending a message after a specified delay. The function takes the following parameters:

- `program` - the program (or user) to which the message will be sent
- `payload` - the payload of the message
- `value` - the amount of tokens to be sent with the message
- `delay` - the delay in blocks after which the message will be sent

The delayed message will be executed after the specified `delay` measured in blocks. For example, on a network with a block producing time of 3 seconds, a delay of 20 is equal to 1 minute.

Gear Protocol enables the message processing to be paid with the reserved gas by using the [`msg::send_delayed_from_reservation`](https://docs.gear.rs/gstd/msg/fn.send_delayed_from_reservation.html) function which takes a reservation ID as the first parameter.

Considering the example with auction, we can start the auction by sending a message to the auction program. After completing all the necessary logic, the auction program will send a delayed message to itself, which will settle the auction after the indicated time.
