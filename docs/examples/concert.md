---
sidebar_label: 'Concert (FT to NFT transition)'
sidebar_position: 8
---

# Concert Contract (FT to NFT transition)

## Introduction

A interface that displays the idea of converting fungible tokens (FT) to non-fungible tokens in time. A single deployed contract can hold one concert at time. Firstly, all the tickets for the concert come as fungible-tokens. In order to buy tickets one should provide the metadata (e.g. seat/row number) that will later be included in NFTs.

When the concert is hold all the fungible tokens of all users (ticket holders) will turn into NFTs.

The idea is simple, all the internal token interactions are hold using GMT-1155 contract, which address must be provided upon initiliazing a concert contract.

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

## Conclusion
A source code of the contract example provided by Gear is available on GitHub: [`concert/src/lib.rs`](https://github.com/gear-tech/apps/blob/master/concert/src/lib.rs).

See also an example of the smart contract testing implementation based on gtest: [`concert/tests/concert_tests.rs`](https://github.com/gear-tech/apps/blob/master/concert/tests/concert_tests.rs).

For more details about testing smart contracts written on Gear, refer to this article: [Program testing](https://wiki.gear-tech.io/developing-contracts/testing).
