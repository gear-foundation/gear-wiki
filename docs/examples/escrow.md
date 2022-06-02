---
sidebar_label: 'Escrow'
sidebar_position: 8
---

# What is an escrow?
An escrow is a special wallet to which some assets (e.g. money or stocks) are deposited and stored until certain conditions are met. In terms of smart contracts, an escrow is a wallet that is stored on a blockchain and, like a regular escrow, can receive some assets (e.g. a cryptocurrency or tokens) from one user and, when certain conditions are met, send them to another.

This article will show the example of an escrow smart contract, where assets will be [Gear fungible tokens - gFT](/examples/gft-20).

## Logic
* Any user can create an escrow wallet as a buyer or seller.
* A buyer can make a deposit or confirm a deal and close a wallet.
* A seller can refund tokens from a paid wallet to a buyer.
* Both buyer and seller can cancel a deal and close an unpaid wallet.

One escrow wallet contains info about a `buyer`, a `seller`, wallet `state` and an `amount` of tokens that this wallet can store:
```rust
struct Wallet {
    buyer: ActorId,
    seller: ActorId,
    state: WalletState,
    amount: u128,
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
### Type aliases
```rust
/// Escrow wallet ID.
type WalletId = U256;
```

### Initialization config
```rust
pub struct InitEscrow {
    /// Address of a fungible token program.
    pub ft_program_id: ActorId,
}
```

### Functions
```rust
fn create(&mut self, buyer: ActorId, seller: ActorId, amount: u128)
```
Creates one escrow wallet and replies with its ID.

Requirements:
* `msg::source()` must be a buyer or seller for this wallet.

Arguments:
* `buyer`: a buyer.
* `seller`: a seller.
* `amount`: an amount of tokens.

```rust
async fn deposit(&mut self, wallet_id: WalletId)
```
Makes a deposit from a buyer to an escrow wallet
and changes a wallet state to `AwaitingConfirmation`.

Requirements:
* `msg::source()` must be a buyer for this wallet.
* Wallet must not be paid or closed.

Arguments:
* `wallet_id`: a wallet ID.

```rust
async fn confirm(&mut self, wallet_id: WalletId)
```
Confirms a deal by transferring tokens from an escrow wallet
to a seller and changing a wallet state to `Closed`.

Requirements:
* `msg::source()` must be a buyer for this wallet.
* Wallet must be paid and unclosed.

Arguments:
* `wallet_id`: a wallet ID.

```rust
async fn refund(&mut self, wallet_id: WalletId)
```
Refunds tokens from an escrow wallet to a buyer
and changes a wallet state back to `AwaitingDeposit`
(that is, a wallet can be reused).

Requirements:
* `msg::source()` must be a seller for this wallet.
* Wallet must be paid and unclosed.

Arguments:
* `wallet_id`: a wallet ID.

```rust
async fn cancel(&mut self, wallet_id: WalletId)
```
Cancels a deal and closes an escrow wallet by changing its state to `Closed`.

Requirements:
* `msg::source()` must be a buyer or seller for this wallet.
* Wallet must not be paid or closed.

Arguments:
* `wallet_id`: a wallet ID.

### Meta state
It is also possible to provide a smart contract the ability to report about its state without consuming gas. This can be done by using the `meta_state` function. It gets the `EscrowState` enum and replies with the `EscrowStateReply` enum specified below:
```rust
enum EscrowState {
    GetInfo(WalletId),
}
```

```rust
enum EscrowStateReply {
    Info(Account),
}
```

### Actions & events
**Action** is an enum that is sent to a program and contains info about what it should do. After a successful processing of **Action**, a program replies with the **Event** enum that contains info about a processed **Action** and its result.

```rust
enum EscrowAction {
    Create {
        buyer: ActorId,
        seller: ActorId,
        amount: u128,
    },
    Deposit(WalletId),
    Confirm(WalletId),
    Refund(WalletId),
    Cancel(WalletId),
}
```

```rust
enum EscrowEvent {
    Cancelled {
        buyer: ActorId,
        seller: ActorId,
        amount: u128,
    },
    Refunded {
        buyer: ActorId,
        amount: u128,
    },
    Confirmed {
        seller: ActorId,
        amount: u128,
    },
    Deposited {
        buyer: ActorId,
        amount: u128,
    },
    Created(WalletId),
}
```

## Source code
The source code of this example of an escrow smart contract and the example of an implementation of its testing is available on [GitHub](https://github.com/gear-academy/escrow).

For more details about testing smart contracts written on Gear, refer to the [Program testing](/developing-contracts/testing) article.
