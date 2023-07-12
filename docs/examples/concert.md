---
sidebar_label: Concert (FT to NFT transition)
sidebar_position: 14
---

# Concert Contract (FT to NFT transition)

## Introduction

This smart contract example created by Gear represents a Concert tickets distribution with the idea of converting fungible tokens (gFT) to non-fungible tokens (gNFT) in time.

The article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own application and run it on the Gear Network. The source code is available on [GitHub](https://github.com/gear-foundation/dapps-concert).

In this example, a single deployed contract can hold one concert at a time. Firstly, all the tickets for the concert come as fungible-tokens. In order to buy tickets one should provide the metadata (e.g. seat/row number) that will later be included in NFTs. When the concert ends, all the fungible tokens of all users (ticket holders) will turn into NFTs.

The idea is simple - all the internal token interactions are handled using the [gMT-1155](gmt-1155.md) contract, which address must be provided upon initializing a concert contract.

## Interface

### Events

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum ConcertEvent {
    Creation {
        creator: ActorId,
        concert_id: u128,
        number_of_tickets: u128,
        date: u128,
    },
    Hold {
        concert_id: u128,
    },
    Purchase {
        concert_id: u128,
        amount: u128,
    },
}
```
### Functions

```rust
/// Create a concert.
/// `concert_id` - is the id of the concert (will become a TokenId for FT minted later).
/// `number_of_tickets` - is the amount of FT minted later.
/// `date` - is the date of the concert holding.
fn create_concert(
    &mut self,
    creator: ActorId,
    concert_id: u128,
    number_of_tickets: u128,
    date: u128,
);

/// Buy tickets.
/// `concert_id` - is the id of the concert.
/// `amount` - is the number of tickets one is trying to purchase.
/// `mtd` - is the tickets metadata (e.g. seat/row). This argument length should equal the `amount` value.
async fn buy_tickets(
    &mut self,
    concert_id: u128,
    amount: u128,
    mtd: Vec<Option<TokenMetadata>>,
);

/// Hold a concert, turning of the FT (aka tickets) into NFTs.
/// `concert_id` - is the id of the concert
async fn hold_concert(&mut self, concert_id: u128)
```
### Init Config
To successfully initialize a concert contract one should provide an ActorID of a GMT-1155 contract to hold all the tokens manipulations. The sender of this message becomes the owner of the contract.

```rust
pub struct InitConcert {
    pub owner_id: ActorId,
    pub mtk_contract: ActorId,
}
```

### `Action` Structure
```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum ConcertAction {
    Create {
        creator: ActorId,
        concert_id: u128,
        number_of_tickets: u128,
        date: u128,
    },
    Hold {
        concert_id: u128,
    },
    BuyTickets {
        concert_id: u128,
        amount: u128,
        metadata: Vec<Option<TokenMetadata>>,
    },
}
```

### Program metadata and state
Metadata interface description:

```rust
pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = In<InitConcert>;
    type Handle = InOut<ConcertAction, ConcertEvent>;
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
To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `State` struct. For example - [gear-foundation/dapps-concert/state](https://github.com/gear-foundation/dapps-concert/tree/master/state):

```rust
#[metawasm]
pub trait Metawasm {
    type State = <ContractMetadata as Metadata>::State;

    fn current_concert(state: Self::State) -> CurrentConcert {
        state.current_concert()
    }

    fn buyers(state: Self::State) -> Vec<ActorId> {
        state.buyers
    }

    fn user_tickets(user: ActorId, state: Self::State) -> Vec<Option<TokenMetadata>> {
        state.user_tickets(user)
    }
}
```

## Conclusion
A source code of the contract example provided by Gear is available on GitHub: [`concert/src`](https://github.com/gear-foundation/dapps-concert/tree/master/src).

See also an example of the smart contract testing implementation based on [gtest](https://github.com/gear-foundation/dapps-concert/tree/master/tests).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
