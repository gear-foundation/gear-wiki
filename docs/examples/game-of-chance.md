---
sidebar_position: 9
---

# Game of chance

## Introduction

:::note

This article explains at a superficial level the purpose and logic of this smart contract. For a more detailed technical description, see its [documentation on the dApps documentation portal](https://dapps.gear.rs/game_of_chance) and [the source code section](#source-code).

:::

Game of chance is a simple game smart contract with the lottery logic.

There is also an example implementation of the Game of chance's user interface and [its source code](https://github.com/gear-tech/gear-js/tree/main/apps/game-of-chance)) to demonstrate an interaction with smart contracts in the Gear Network.

<!-- > <iframe width="100%" height="315" src="https://www.youtube.com/embed/35StUMjbdFc" allow="fullscreen"></iframe>
-->

## Logic

During an initialization, the game administrator is assigned. It has the rights to start a new game round and pick a winner after the end of each one. Other actors can participate in a round if they have enough fungible tokens or the native value, they're used to collect prize fund. After the end of the players entry stage, the administrator should execute the action for picking a winner, and this smart contract does it randomly and then sends prize fund to the winner.

## Interface

### Initialization

```rust
/// Initializes the Game of chance contract.
///
/// # Requirements
/// - `admin` mustn't be [`ActorId::zero()`].
#[derive(Debug, Default, Encode, Decode, PartialEq, Eq, PartialOrd, Ord, Clone, TypeInfo)]
pub struct GOCInit {
    /// [`ActorId`] of the game administrator that'll have the rights to
    /// [start a game round](GOCAction::Start) and
    /// [pick a winner](GOCAction::PickWinner).
    pub admin: ActorId,
}
```

### Actions

```rust
/// Sends a contract info about what it should do.
#[derive(Debug, Encode, Decode, PartialEq, Eq, PartialOrd, Ord, Clone, Copy, TypeInfo)]
pub enum GOCAction {
    /// Starts a game round and allows to participate in it.
    ///
    /// # Requirements
    /// - [`msg::source()`](gstd::msg::source) must be the game administrator.
    /// - The current game round must be over.
    /// - `ft_actor_id` mustn't be [`ActorId::zero()`].
    ///
    /// On success, replies with [`GOCEvent::Started`].
    Start {
        /// The duration (in milliseconds) of the players entry stage.
        ///
        /// After that, no one will be able to enter a game round and a winner
        /// should be picked.
        duration: u64,
        /// The price of participation in a game round.
        participation_cost: u128,
        /// A currency (or FT contract [`ActorId`]) of a game round.
        ///
        /// Determines fungible tokens in which a prize fund and a participation
        /// cost will be collected. [`None`] means that the native value will be
        /// used instead of fungible tokens.
        ft_actor_id: Option<ActorId>,
    },

    /// Randomly picks a winner from current game round participants (players)
    /// and sends a prize fund to it.
    ///
    /// The randomness of a winner pick depends on
    /// [`exec::block_timestamp()`](gstd::exec::block_timestamp).
    /// Not the best source of entropy, but, in theory, it's impossible to
    /// exactly predict a winner if the time of an execution of this action is
    /// unknown.
    ///
    /// If no one participated in the round, then a winner will be
    /// [`ActorId::zero()`].
    ///
    /// # Requirements
    /// - [`msg::source()`](gstd::msg::source) must be the game administrator.
    /// - The players entry stage must be over.
    /// - A winner mustn't already be picked.
    ///
    /// On success, replies with [`GOCEvent::Winner`].
    PickWinner,

    /// Pays a participation cost and adds [`msg::source()`] to the current game
    /// round participants (players).
    ///
    /// A participation cost and its currency can be queried by the
    /// `meta_state()` entry function.
    ///
    /// # Requirements
    /// - The players entry stage mustn't be over.
    /// - [`msg::source()`] mustn't already participate.
    /// - [`msg::source()`] must have enough currency to pay a participation
    /// cost.
    /// - If the current game round currency is the native value (`ft_actor_id`
    /// is [`None`]), [`msg::source()`] must send this action with the amount of
    /// the value exactly equal to a participation cost.
    ///
    /// On success, replies with [`GOCEvent::PlayerAdded`].
    ///
    /// [`msg::source()`]: gstd::msg::source
    Enter,
}
```

### Program metadata and state
Metadata interface description:

```rust
pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = InOut<Initialize, Result<(), Error>>;
    type Handle = InOut<Action, Result<Event, Error>>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = State;
}
```
To display the full contract state information, the `state()` function is used:

```rust
#[no_mangle]
extern "C" fn state() {
    reply(common_state())
        .expect("Failed to encode or reply with `<ContractMetadata as Metadata>::State` from `state()`");
}
```
To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `State` struct.

## Source code

The source code of the Game of chance smart contract and an implementation of its testing is available on [GitHub](https://github.com/gear-dapps/game-of-chance). They can be used as is or modified to suit your own scenarios.

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
