---
sidebar_label: 'Escrow'
sidebar_position: 8
---

# What is an escrow?
An escrow is a special account to which some assets (e.g. money or stocks) are deposited and stored until certain conditions are met. In terms of smart contracts, an escrow is an account that is stored on a blockchain and, like a regular escrow, can receive some assets (e.g. a cryptocurrency or tokens) from one user and, when certain conditions are met, send them to another.

This article will show the example of an escrow smart contract, where assets will be [Gear fungible tokens - GFT](/examples/gft-20).

## Logic
* Any user can create an escrow account as its buyer or seller.
* The buyer can make a deposit to or confirm an account.
* The seller can refund tokens from a paid account to the buyer.
* Both buyer and seller can cancel an unpaid account.

One escrow account contains info about a `buyer`, a `seller`, their `state` and an `amount` of tokens that this account can store:

```rust
struct Account {
    buyer: ActorId,
    seller: ActorId,
    state: AccountState,
    amount: u128,
}
```

`AccountState` is an enum that stores a current state of an account:
```rust
enum AccountState {
    AwaitingDeposit,
    AwaitingConfirmation,
    Closed,
}
```

## Interface
### Initialization config
```rust
pub struct InitEscrow {
    // Address of a fungible token program.
    pub ft_program_id: ActorId,
}
```

### Functions
```rust
fn create(&mut self, buyer: ActorId, seller: ActorId, amount: u128)
```
Creates one escrow account and replies with its ID.

Requirements:
* `msg::source()` must be a buyer or seller for the account.

Arguments:
* `buyer`: a buyer.
* `seller`: a seller.
* `amount`: an amount of tokens.

```rust
async fn deposit(&mut self, account_id: U256)
```
Makes a deposit from a buyer to an escrow account
and changes an account state to `AwaitingConfirmation`.

Requirements:
* `msg::source()` must be a buyer saved in the account.
* An account must not be paid or closed.

Arguments:
* `account_id`: an account ID.

```rust
async fn confirm(&mut self, account_id: U256)
```
Confirms an escrow account by transferring tokens from it
to a seller and changing an account state to `Closed`.

Requirements:
* `msg::source()` must be a buyer saved in the account.
* An account must be paid and unclosed.

Arguments:
* `account_id`: an account ID.

```rust
async fn refund(&mut self, account_id: U256)
```
Refunds tokens from an escrow account to a buyer
and changes an account state back to `AwaitingDeposit`
(that is, the account can be reused).

Requirements:
* `msg::source()` must be a seller saved in the account.
* An account must be paid and unclosed.

Arguments:
* `account_id`: an account ID.

```rust
async fn cancel(&mut self, account_id: U256)
```
Cancels (early closes) an escrow account by changing its state to `Closed`.

Requirements:
* `msg::source()` must be a buyer or seller saved in the account.
* An account must not be paid or closed.

Arguments:
* `account_id`: an account ID.

### Meta state
It is also possible to provide a smart contract the ability to report about its state without consuming gas. This can be done by using the `meta_state` function. It gets the `EscrowState` enum and replies with the `EscrowStateReply` enum specified below:
```rust
enum EscrowState {
    GetInfo(U256),
}
```

```rust
enum EscrowStateReply {
    Info(Account),
}
```

### Actions & events
**Action** is an enum that is sent to a program and contains info about what it should do. After a successful processing of **Action**, a program replies with **Event** enum that contains info about a processed **Action** and its result.

```rust
enum EscrowAction {
    Create {
        buyer: ActorId,
        seller: ActorId,
        amount: u128,
    },
    Deposit(U256),
    Confirm(U256),
    Refund(U256),
    Cancel(U256),
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
    Created(U256),
}
```

## Source code
The source code of this example of an escrow smart contract and the example of an implementation of its testing is available on [GitHub](https://github.com/gear-tech/apps/blob/master/escrow).

For more details about testing smart contracts written on Gear, refer to the [Program testing](/developing-contracts/testing) article.
