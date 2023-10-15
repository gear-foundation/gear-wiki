---
sidebar_label: Concert (FT to NFT transition)
sidebar_position: 14
---

# Concert Contract (FT to NFT transition)

## Introduction

This smart contract example created by Gear represents a Concert tickets distribution with the idea of converting fungible tokens (gFT) to non-fungible tokens (gNFT) in time.

The article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own application and run it on the Gear Network. The source code is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/concert).

In this example, a single deployed contract can hold one concert at a time. Firstly, all the tickets for the concert come as fungible-tokens. In order to buy tickets one should provide the metadata (e.g. seat/row number) that will later be included in NFTs. When the concert ends, all the fungible tokens of all users (ticket holders) will turn into NFTs.

The idea is simple - all the internal token interactions are handled using the [gMT-1155](../Standards/gmt-1155.md) contract, which address must be provided upon initializing a concert contract.

## Interface

### Events

```rust title="concert/io/src/lib.rs"
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
#### Create a concert
```rust title="concert/src/lib.rs"
/// Create a concert.
/// `number_of_tickets` - is the amount of FT minted later.
/// `date` - is the date of the concert holding.
fn create_concert(
    &mut self,
    name: String,
    description: String,
    creator: ActorId,
    number_of_tickets: u128,
    date: u128,
) {
// ...
```
- `name` - is the name of an upcoming concert.
- `creator` - is a description of the concert.
- `creator` - is the creator of the concert (the creator will have more functionality).
- `number_of_tickets` - is the amount of FT minted later.
- `date` - is the date of the concert holding.

#### Buy tickets
```rust title="concert/src/lib.rs"
async fn buy_tickets(&mut self, amount: u128, mtd: Vec<Option<TokenMetadata>>) {
// ...
```
- `amount` - is the number of tickets one is trying to purchase.
- `mtd` - is the tickets metadata (e.g. seat/row). This argument length should equal the `amount` value.

#### Hold a concert
```rust title="concert/src/lib.rs"
async fn hold_concert(&mut self) {
// ...
```
>Hold a concert, turning of the FT (aka tickets) into NFTs; the hold a concert functionality is only available to the creator

### Init Config
To successfully initialize a concert contract one should provide an ActorID of a GMT-1155 contract to hold all the tokens manipulations. The sender of this message becomes the owner of the contract.

```rust title="concert/io/src/lib.rs"
pub struct InitConcert {
    pub owner_id: ActorId,
    pub mtk_contract: ActorId,
}
```

### `Action` Structure
```rust title="concert/io/src/lib.rs"
pub enum ConcertAction {
    Create {
        creator: ActorId,
        name: String,
        description: String,
        number_of_tickets: u128,
        date: u128,
    },
    Hold,
    BuyTickets {
        amount: u128,
        metadata: Vec<Option<TokenMetadata>>,
    },
}
```

### Program metadata and state
Metadata interface description:

```rust title="concert/io/src/lib.rs"
pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = In<InitConcert>;
    type Handle = InOut<ConcertAction, ConcertEvent>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Out<State>;
}
```
To display the full contract state information, the `state()` function is used:

```rust title="concert/src/lib.rs"
#[no_mangle]
extern fn state() {
    let contract = unsafe { CONTRACT.take().expect("Unexpected error in taking state") };
    msg::reply::<State>(contract.into(), 0)
        .expect("Failed to encode or reply with `State` from `state()`");
}
```
To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `State` struct. For example - [concert/state](https://github.com/gear-foundation/dapps/tree/master/contracts/concert/state):

```rust title="concert/state/src/lib.rs"
#[gmeta::metawasm]
pub mod metafns {
    pub type State = concert_io::State;

    pub fn current_concert(state: State) -> CurrentConcert {
        state.current_concert()
    }

    pub fn buyers(state: State) -> Vec<ActorId> {
        state.buyers
    }

    pub fn user_tickets(state: State, user: ActorId) -> Vec<Option<TokenMetadata>> {
        state.user_tickets(user)
    }
}
```

## Conclusion
A source code of the contract example provided by Gear is available on GitHub: [`concert/src`](https://github.com/gear-foundation/dapps/tree/master/contracts/concert/src).

See also an example of the smart contract testing implementation based on [gtest](https://github.com/gear-foundation/dapps/tree/master/contracts/concert/tests).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
