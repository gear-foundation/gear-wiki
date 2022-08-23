---
sidebar_position: 8
---

# Escrow

## Introduction

An escrow is a special wallet to which some assets (e.g. money or stocks) are deposited and stored until certain conditions are met. In terms of smart contracts, an escrow is a wallet that is stored on a blockchain and, like a regular escrow, can receive some assets (e.g. a cryptocurrency or fungible tokens (like [Gear fungible tokens - gFT](gft-20.md) in this example)) from one user and, when certain conditions are met, send them to another.

This article explains at a superficial level the purpose and logic of this smart contract. For a more detailed technical description, see its [documentation on the dapps documentation portal](https://dapps.gear.rs/escrow_io) and [source code](#source-code).

You can watch a video on how to get the Escrow application up and running and its capabilities here: **https://youtu.be/CD8j4epEY4E**.

## Logic

* Any user can create an escrow wallet as a buyer or seller.
* A buyer can make a deposit or confirm a deal and close a wallet.
* A seller can refund tokens from a paid wallet to a buyer.
* Both buyer and seller can cancel a deal and close an unpaid wallet.

One escrow wallet contains info about a `buyer`, a `seller`, wallet `state` and an `amount` of tokens that this wallet can store:

```rust
pub struct Wallet {
    /// A buyer.
    pub buyer: ActorId,
    /// A seller.
    pub seller: ActorId,
    /// A wallet state.
    pub state: WalletState,
    /// An amount of tokens that a wallet can have. **Not** a current amount on
    /// a wallet balance!
    pub amount: u128,
}
```

`WalletState` is an enum that stores a current state of a wallet:

```rust
enum WalletState {
    AwaitingDeposit,
    AwaitingConfirmation,
    Closed,
}
```

## Interface

### Initialization

```rust
/// Initializes an escrow program.
#[derive(Decode, Encode, TypeInfo)]
pub struct InitEscrow {
    /// Address of a fungible token program.
    pub ft_program_id: ActorId,
}
```

### Actions

```rust
/// An enum to send the program info about what it should do.
///
/// After a successful processing of this enum, the program replies with [`EscrowEvent`].
#[derive(Decode, Encode, TypeInfo)]
pub enum EscrowAction {
    /// Creates one escrow wallet and replies with its ID.
    ///
    /// # Requirements
    /// * [`msg::source()`](gstd::msg::source) must be `buyer` or `seller` for this wallet.
    /// * `buyer` or `seller` mustn't have the zero address.
    ///
    /// On success, returns [`EscrowEvent::Created`].
    Create {
        /// A buyer.
        buyer: ActorId,
        /// A seller.
        seller: ActorId,
        /// An amount of tokens.
        amount: u128,
    },

    /// Makes a deposit from a buyer to an escrow wallet
    /// and changes wallet's [`WalletState`] to [`AwaitingConfirmation`](WalletState::AwaitingConfirmation).
    ///
    /// Transfers tokens to an escrow wallet until a deal is confirmed (by [`EscrowAction::Confirm`]) or cancelled ([`EscrowAction::Cancel`]).
    ///
    /// # Requirements
    /// * [`msg::source()`](gstd::msg::source) must be a buyer for this wallet.
    /// * Wallet mustn't be paid or closed (that is, wallet's [`WalletState`] must be [`AwaitingDeposit`](WalletState::AwaitingDeposit)).
    ///
    /// On success, returns [`EscrowEvent::Deposited`].
    Deposit(
        /// A wallet ID.
        WalletId,
    ),

    /// Confirms a deal by transferring tokens from an escrow wallet
    /// to a seller and changing wallet's [`WalletState`] to [`Closed`](WalletState::Closed).
    ///
    /// Transfers tokens from an escrow wallet to a seller for this wallet.
    ///
    /// # Requirements
    /// * [`msg::source()`](gstd::msg::source) must be a buyer for this wallet.
    /// * Wallet must be paid and unclosed (that is, wallet's [`WalletState`] must be [`AwaitingDeposit`](WalletState::AwaitingConfirmation)).
    ///
    /// On success, returns [`EscrowEvent::Confirmed`].
    Confirm(
        /// A wallet ID.
        WalletId,
    ),

    /// Refunds tokens from an escrow wallet to a buyer
    /// and changes wallet's [`WalletState`] back to [`AwaitingDeposit`](WalletState::AwaitingDeposit)
    /// (that is, a wallet can be reused).
    ///
    /// Refunds tokens from an escrow wallet to a buyer for this wallet.
    ///
    /// # Requirements
    /// * [`msg::source()`](gstd::msg::source) must be a seller for this wallet.
    /// * Wallet must be paid and unclosed (that is, wallet's [`WalletState`] must be [`AwaitingDeposit`](WalletState::AwaitingConfirmation)).
    ///
    /// On success, returns [`EscrowEvent::Refunded`].
    Refund(
        /// A wallet ID.
        WalletId,
    ),

    /// Cancels a deal and closes an escrow wallet by changing its [`WalletState`] to [`Closed`](WalletState::Closed).
    ///
    /// # Requirements
    /// * [`msg::source()`](gstd::msg::source) must be a buyer or seller for this wallet.
    /// * Wallet mustn't be paid or closed (that is, wallet's [`WalletState`] must be [`AwaitingDeposit`](WalletState::AwaitingDeposit)).
    ///
    /// On success, returns [`EscrowEvent::Cancelled`].
    Cancel(
        /// A wallet ID.
        WalletId,
    ),
}
```

### Meta state queries

```rust
/// An enum for requesting the program state.
///
/// After a successful processing of this enum, the program replies with [`EscrowStateReply`].
#[derive(Decode, Encode, TypeInfo)]
pub enum EscrowState {
    /// Gets wallet info.
    ///
    /// On success, returns [`EscrowStateReply::Info`].
    Info(
        /// A wallet ID.
        WalletId,
    ),
    /// Gets all created wallets.
    ///
    /// On success, returns [`EscrowStateReply::CreatedWallets`].
    CreatedWallets,
}
```

## User interface

A [Ready-to-Use application](https://escrow.gear-tech.io/) example provides a user interface that interacts with [Escrow](https://github.com/gear-dapps/escrow) smart contract running in Gear Network.

This video demonstrates how to configure and run Escrow application on your own and explains the user interaction workflow: **https://youtu.be/CD8j4epEY4E**

![img alt](./img/escrow.png)

The application's source code is available on [GitHub](https://github.com/gear-tech/gear-js/tree/main/apps/escrow).

### Configure basic dApp in .env:

For proper application functioning, one needs to create `.env` file and adjust an environment variable parameters. An example is available [here](https://github.com/gear-tech/gear-js/blob/main/apps/escrow/.env.example).

```sh
REACT_APP_NODE_ADDRESS
```

- `REACT_APP_NODE_ADDRESS` is the Gear Network's address (wss://rpc-node.gear-tech.io:443)

:::note

In order for all features to work as expected, the node and its runtime version should be chosen based on the current @gear-js/api version.

In case of issues with the application, try to switch to another network or run your own local node and specify its address in the .env file. When applicable, make sure the smart contract(s) wasm files are uploaded and running in this network accordingly.

:::

## Source code

The source code of this example of an escrow smart contract and an implementation of its testing is available on [GitHub](https://github.com/gear-dapps/escrow). They can be used as is or modified to suit your own scenarios.

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
