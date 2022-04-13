---
sidebar_label: 'Escrow'
sidebar_position: 8
---

# What is an escrow?
An escrow is a special account to which some assets (e.g. money or stocks) are deposited and stored until certain conditions are met. In terms of smart contracts, an escrow is a program that is stored on a blockchain and, like a regular escrow, can receive some assets (e.g. a cryptocurrency or tokens) from one user and, when certain conditions are met, send them to another.

This article will show the example of an escrow smart contract, where assets will be [ERC-20 tokens](https://eips.ethereum.org/EIPS/eip-20).

## Logic
* Any user can create a contract as a buyer or seller.
* A buyer can make a deposit and confirm a contract.
* A seller can refund tokens from a paid contract to a buyer.
* Both buyer and seller can cancel an unpaid contract.

One escrow contract contains info about a `buyer`, a `seller`, their `state` and an `amount` of tokens that this contract can store:

```rust
struct Contract {
    buyer: ActorId,
    seller: ActorId,
    state: State,
    amount: u128,
}
```

`State` is an enum that stores a current state of a contract:
```rust
enum State {
    AwaitingDeposit,
    AwaitingConfirmation,
    Completed,
}
```

## Interface
### Functions
```rust
fn create(&mut self, buyer: ActorId, seller: ActorId, amount: u128)
```

Creates one escrow contract and replies with an ID of this created contract.

Requirements:
* `msg::source()` must be a buyer or seller for this contract.

Arguments:
* `buyer`: a buyer.
* `seller`: a seller.
* `amount`: an amount of tokens.

```rust
async fn deposit(&mut self, contract_id: u128)
```

Makes a deposit from a buyer to an escrow account
and changes a contract state to `AwaitingConfirmation`.

Requirements:
* `msg::source()` must be a buyer saved in a contract.
* Contract must not be paid or completed.

Arguments:
* `contract_id`: a contract ID.

```rust
async fn confirm(&mut self, contract_id: u128)
```

Confirms contract by transferring tokens from an escrow account
to a seller and changing contract state to `Completed`.

Requirements:
* `msg::source()` must be a buyer saved in contract.
* Contract must be paid and uncompleted.

Arguments:
* `contract_id`: a contract ID.

```rust
async fn refund(&mut self, contract_id: u128)
```

Refunds tokens from an escrow account to a buyer
and changes contract state to `AwaitingDeposit`
(that is, a contract can be reused).

Requirements:
* `msg::source()` must be a seller saved in contract.
* Contract must be paid and uncompleted.

Arguments:
* `contract_id`: a contract ID.

```rust
async fn cancel(&mut self, contract_id: u128)
```

Cancels (early completes) a contract by changing its state to `Completed`.

Requirements:
* `msg::source()` must be a buyer or seller saved in contract.
* Contract must not be paid or completed.

Arguments:
* `contract_id`: a contract ID.

### Actions & events
**Action** is an enum that is sent to a program and contains info about what it should do. After a successful processing of **Action**, a program replies with **Event** enum that contains info about a processed **Action** and its result.

```rust
pub enum EscrowAction {
    Create {
        buyer: ActorId,
        seller: ActorId,
        amount: u128,
    },
    Deposit {
        contract_id: u128,
    },
    Confirm {
        contract_id: u128,
    },
    Refund {
        contract_id: u128,
    },
    Cancel {
        contract_id: u128,
    },
}
```

```rust
pub enum EscrowEvent {
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
    Created {
        contract_id: u128,
    },
}
```

### Initialization config
```rust
pub struct InitEscrow {
    // Address of a fungible token program.
    pub ft_program_id: ActorId,
}
```

## Source code
The source code of this example of an escrow smart contract is available on [GitHub](https://github.com/gear-tech/apps/blob/master/escrow).
