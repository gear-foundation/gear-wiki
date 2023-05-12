---
sidebar_label: Transaction manager
---

# Transaction manager

With the advent of complex asynchronous smart contracts, like [SFT](https://github.com/gear-dapps/sharded-fungible-token), the transaction caching was introduced. It allows transaction data to be saved on different stages, and a failed transaction to be reexecuted whilst skipping completed stages, thereby saving gas. Most often the reason for the failed transaction is the lack of gas. Unfortunately, this algorithm isn't too user-friendly because users of contracts with caching must track cached transaction identifiers, and increment their number on each successful execution.

The transaction manager is intended to help solve this problem. In simple words, The transaction manager stores pairs of `msg::source()` & some data that a contract developer wants to save for this `msg::source()`. The manager has a limit at which it starts to replace old pairs with new ones. While doing all this, it tracks transaction identifiers (or more specifically slices of identifiers) for all pairs. Thus, having only `msg::source()`, it's possible to acquire `TransactionGuard` with `Stepper` inside, and by calling `Stepper::step()` always get the correct transaction identifier regardless of whether the transaction is new or cached.

## Usage

```rust
use ft_main_io::{FTokenAction, LogicAction};
use gear_lib::tx_manager::{self, TransactionManager};
use gstd::{msg, prelude::*, ActorId};

// The contract state.
static mut STATE: Option<(TransactionManager<InnerAction>, ActorId)> = None;

// Data that'll be cached by the transaction manager.
#[derive(Decode, Clone, Copy, PartialEq)]
enum InnerAction {
    Add(ActorId, u128),
    Sub(ActorId, u128),
}

// `Action` is the generic type with some convinient methods for use with the
// manager.
type Action = tx_manager::Action<InnerAction>;

#[no_mangle]
extern "C" fn init() {
    let ftoken_address = msg::load().unwrap();

    // Firstly the transaction manager must be created on the contract
    // initialization.
    unsafe { STATE = Some((TransactionManager::new(), ftoken_address)) }
}

#[gstd::async_main]
async fn main() {
    let Action { kind, action } = msg::load().unwrap();
    let (manager, ftoken_address) = unsafe { STATE.as_mut().unwrap() };

    // And here's the main method of the manager. It'll save and asquire a
    // unique transaction guard for each `msg::source()`.
    let mut tx_guard = manager
        .asquire_transaction(msg::source(), kind.to_tx_kind(action))
        .unwrap();

    // The guard contains user defined data, here it's `InnerAction`.
    tx_guard
        .tx_data
        // The data can be checked to prevent users from exploiting a cache that
        // wasn't saved initially, or be used as is since all guard fields are
        // public.
        // So, in this case, the code prevents user from, e.g., using
        // `InnerAction::Add()` if for the current `msg::source()`
        // `InnerAction::Sub()` was saved.
        .check_tx_data(|tx_data| *tx_data == action)
        .unwrap();

    match action {
        InnerAction::Add(recipient, amount) => msg::send(
            *ftoken_address,
            FTokenAction::Message {
                // `Stepper::step()` gets the next transaction identifier for
                // the current action. If action `kind` is `ActionKind::New`,
                // then it'll be a new identifier. If action `kind` is
                // `ActionKind::Retry`, then it'll be an old one, and SFT will
                // return a cached reply.
                transaction_id: tx_guard.stepper.step().unwrap(),
                payload: LogicAction::Mint { recipient, amount },
            },
            0,
        )
        .unwrap(),
        InnerAction::Sub(sender, amount) => msg::send(
            *ftoken_address,
            FTokenAction::Message {
                // The same here.
                transaction_id: tx_guard.stepper.step().unwrap(),
                payload: LogicAction::Burn { sender, amount },
            },
            0,
        )
        .unwrap(),
    };
}
```

## Public interface

In the public interface (i.e. the `io` crate), the transaction manager should have only the `ActionKind` enum:

```rust
enum ActionKind {
    // Execute & write a new action to cache.
    New,
    // Execute a cached action.
    Retry,
}
```

It has the following properties:
- Only one action for each `msg_source` is cached. Hence an attempt to save a `New` transaction over a failed one will delete the failed one, so it'll be **impossible** to `Retry` the latter.
- There's no guarantee every underprocessed asynchronous action will result in a cached transaction. Usually caching occurs after the first blocking `.await` during action processing.
- The cache memory has a limit, so when it's reached every oldest cached transaction is replaced with a new one.
