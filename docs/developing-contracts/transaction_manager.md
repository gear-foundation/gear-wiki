---
sidebar_label: Transaction manager
---

# Transaction manager

With the advent of complex asynchronous smart contracts, like [SFT](https://github.com/gear-dapps/sharded-fungible-token), the transaction caching was introduced. It allows transaction data to be saved on different stages, and a failed transaction to be reexecuted whilst skipping completed stages, thereby saving gas. Most often the reason for the failed transaction is the lack of gas. Unfortunately, this algorithm isn't too user-friendly because users of contracts with caching must track cached transaction identifiers, and increment their number on each successful execution.

The transaction manager is intended to help solve this problem. In simple words, The transaction manager stores pairs of `msg::source()` & some data that a contract developer wants to save for this `msg::source()`. The manager has a limit at which it starts to replace old pairs with new ones. While doing all this, it tracks transaction identifiers (or more specifically slices of identifiers) for all pairs. Thus, having only `msg::source()`, it's possible to acquire `TransactionGuard` with `Stepper` inside, and by calling `Stepper::step()` always get the correct transaction identifier regardless of whether the transaction is new or cached.

## Interface

```rust
/// The transaction manager.
pub struct TransactionManager<T> { ... }

impl<T> TransactionManager<T> {
    /// Creates the manager with [`DEFAULT_TX_LIMIT`].
    ///
    /// To create it with a custom limit, use
    /// [`TransactionManager::new_with_custom_limit()`].
    pub fn new() -> Self;

    /// Creates the manager with custom `tx_limit`.
    ///
    /// # Errors
    /// [`TransactionManagerError::Overflow`] if `tx_limit` > [`MAX_TX_LIMIT`].
    ///
    /// To create the manager with the default limit, use
    /// [`TransactionManager::new()`].
    pub fn new_with_custom_limit(tx_limit: NonZeroU32) -> Result<Self, TransactionManagerError>;

    /// Asquires the transaction for a given [`msg::source()`].
    ///
    /// # Errors
    /// [`TransactionManagerError::TransactionNotFound`] if `kind` is
    /// [`TransactionKind::Retry`], and transaction for given `msg_source`
    /// wasn't found.
    ///
    /// # Panics
    /// If `msg_source` is [`ActorId::zero()`]. [`msg::source()`] can't be
    /// [`ActorId::zero()`] because the manager use it for shadowing old
    /// transaction data.
    pub fn asquire_transaction(
        &mut self,
        msg_source: ActorId,
        kind: TransactionKind<T>,
    ) -> Result<TransactionGuard<'_, T>, TransactionManagerError>;


    /// Returns pairs of [`msg::source()`](gstd::msg::source) & cached
    /// transaction data in order from oldest to newest.
    ///
    /// Can be used to generate a list of cached transaction for the `state()`
    /// entry point.
    pub fn cached_transactions(&self) -> impl Iterator<Item = (&ActorId, &T)>;
}

/// The default transaction limit.
///
/// The contract storage is limited, so cached transactions can't take up all
/// the space. Note that although this limit may be enough for most example
/// cases, the real contract structure may still be very different, so it's
/// recommended to calculate an individual limit for each contract, and set it
/// with [`TransactionManager::new_with_custom_limit()`].
pub const DEFAULT_TX_LIMIT: NonZeroU32 = unsafe { NonZeroU32::new_unchecked(2u32.pow(16)) };
/// The maximum transaction limit.
///
/// A transaction limit mustn't be more than [`u32::MAX`]` / `[`u8::MAX`]` - 1`.
/// With the current contract memory limit (32 MB), it's impossible to store
/// even the half of this amount, so consider this just as an additional
/// restriction.
///
/// The reason for it is the [`TransactionManager`]'s logic for
/// [`TransactionId`] traversing. The manager divides available
/// [`TransactionId`]s by [`u8::MAX`], saves only division indexes, and
/// multiplies them by [`u8::MAX`] to get actual [`TransactionId`]s. Hence to
/// avoid the [`u32`] overflow, the maximum amount of cached transactions
/// multiplied by [`u8::MAX`] mustn't be more than
/// [`u32::MAX`]` / `[`u8::MAX`]` - 1`.
pub const MAX_TX_LIMIT: NonZeroU32 = unsafe { NonZeroU32::new_unchecked(u32::MAX / u8::MAX as u32 - 1) };

/// A transaction identifier.
pub type TransactionId = u64;

/// The kind of a transaction to get from [`TransactionManager`].
pub enum TransactionKind<T> {
    /// A new transaction with some data to be cached.
    ///
    /// Keep the data as compact as possible because it'll stay in the contract
    /// memory until the transaction limit for [`TransactionManager`] is
    /// reached and the data overwritten with new transaction data.
    New(T),

    /// A cached transaction.
    Retry,
}

/// The transaction manager error variants.
pub enum TransactionManagerError {
    /// There's no cached transaction for given
    /// [`msg::source()`](gstd::msg::source()). The reason may be a
    /// transaction's action wasn't asynchronous or just wasn't cached, or a
    /// cached transaction was removed because it was too old.
    TransactionNotFound,
    /// [`TransactionData`] failed a check in one of its methods.
    MismatchedTxData,
    /// See [`TransactionManager::new_with_custom_limit()`] or
    /// [`Stepper::step()`].
    Overflow,
}

/// A transaction guard.
pub struct TransactionGuard<'tx, T> {
    pub tx_data: TransactionData<'tx, T>,
    pub stepper: Stepper,
}

/// Transaction data.
pub struct TransactionData<'tx, T>(pub &'tx mut T);

impl<T> TransactionData<'_, T> {
    /// Checks transaction data with a given closure and returns a mutable
    /// reference to the data or a part of it.
    ///
    /// # Errors
    /// [`TransactionManagerError::MismatchedTxData`] if a check resulted in
    /// [`None`].
    pub fn check_and_get_tx_data<D>(
        &mut self,
        mut check: impl FnMut(&mut T) -> Option<&mut D>,
    ) -> Result<&mut D, TransactionManagerError>;

    /// Checks transaction data with a given closure.
    ///
    /// # Errors
    /// [`TransactionManagerError::MismatchedTxData`] if a check resulted in
    /// [`false`].
    pub fn check_tx_data(
        &self,
        mut check: impl FnMut(&T) -> bool,
    ) -> Result<(), TransactionManagerError>;
}

/// A [`TransactionId`] tracker for the current transaction.
pub struct Stepper { ... }

impl Stepper {
    /// Gets the next [`TransactionId`] for the current transaction.
    ///
    /// The current limit for steps is [`u8::MAX`]. Since there are usually far
    /// fewer than [`u8::MAX`] interactions between contracts per action, this
    /// should be sufficient.
    ///
    /// # Errors
    /// [`TransactionManagerError::Overflow`] if the limit for [`Stepper`] was
    /// exceeded.
    pub fn step(&mut self) -> Result<TransactionId, TransactionManagerError>;
}
```

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
