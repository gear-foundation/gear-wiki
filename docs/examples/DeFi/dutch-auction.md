---
sidebar_label: Dutch Auction
sidebar_position: 3
---

# Dutch auction

## Introduction

A Dutch auction is one of several types of auctions for buying or selling goods. Most commonly, it refers to an auction in which the auctioneer begins with a high asking price in the case of selling and gradually lowers it until some participant accepts the price or it reaches a predetermined reserve price. A Dutch auction has also been referred to as a clock auction or open-outcry descending-price auction. This type of auction demonstrates the advantage of speed since a sale never requires more than one bid.

The auction uses [Gear non-fungible tokens (gNFT)](../Standards/gnft-721.md) as tradable goods.

The article explains the programming interface, data structure, basic functions, and their respective purposes. It can be used as-is or modified to suit your own scenarios. Anyone can easily create their own application and run it on the Gear Network. The source code is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/dutch-auction).

## Program description

### Actions

```rust title="dutch-auction/io/src/auction.rs"
pub enum Action {
    /// Creates auction
    Create(CreateConfig),
    /// Buy current NFT
    Buy,
    /// Stop Auction
    ForceStop,
    /// Reward gas to NFT seller
    Reward,
}

```

- `Buy` is an action to buy an GNFT token by current price
- `Create(CreateConfig)` is an action to create a new auction if the previous one is over or if it's the first auction in this program.
- `ForceStop` is an action to force stop an auction if program owner would prefer to finish it ahead of time

>Note how Dutch Auction is composed; that allows users to reuse its functionality over and over again.

#### Structures in actions:

```rust title="dutch-auction/io/src/auction.rs"
pub struct CreateConfig {
    pub nft_contract_actor_id: ActorId,
    pub token_id: U256,
    pub starting_price: u128,
    pub discount_rate: u128,
    pub duration: Duration,
}
```
**To create a new auction you need to have these fields:**

- `nft_contract_actor_id` is the program (smart contract) address where the auctioneer's NFT has been minted.
- `token_id` is the ID of the NFT within its contract.
- `starting_price` is the initial price at which the auction begins and subsequently decreases.
- `discount_rate` is the rate at which the price decreases per millisecond over time.
- `duration` is a property that is needed to set the duration of the auction.

```rust title="dutch-auction/io/src/auction.rs"
pub struct Duration {
    pub hours: u64,
    pub minutes: u64,
    pub seconds: u64,
}
```

- `hours` amount of hours in period
- `minutes` amount of minutes in period
- `seconds` amount of seconds in period

### Events

```rust title="dutch-auction/io/src/auction.rs"
pub enum Event {
    AuctionStarted {
        token_owner: ActorId,
        price: u128,
        token_id: U256,
    },
    Bought {
        price: u128,
    },
    AuctionStopped {
        token_owner: ActorId,
        token_id: U256,
    },
    Rewarded {
        price: u128,
    },
}
```
- `AuctionStarted` is an event that occurs when someone use `Create(CreateConfig)` successfully
- `AuctionStoped` is an event that occurs when program owner forcibly ends the auction

## Consistency of program states
The `Dutch auction` program interacts with the `non-fungible token` contract. Each transaction that modifies the states of the Dutch Auction and the non-fungible token is stored in the state until it is completed. A user can finalize a pending transaction by sending a message that exactly matches the previous one while specifying the transaction ID. The idempotency of the non-fungible token contract allows for the restarting of a transaction without causing duplicate changes, ensuring the state consistency of these two programs.

### Programm metadata and state
Metadata interface description:

```rust title="dutch-auction/io/src/io.rs"
pub struct AuctionMetadata;

impl Metadata for AuctionMetadata {
    type Init = ();
    type Handle = InOut<Action, Result<Event, Error>>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = Out<AuctionInfo>;
}
```
To display the full program state information, the `state()` function is used:

```rust title="dutch-auction/src/lib.rs"
#[no_mangle]
extern fn state() {
    let contract = unsafe { AUCTION.take().expect("Unexpected error in taking state") };
    msg::reply::<AuctionInfo>(contract.into(), 0)
        .expect("Failed to encode or reply with `AuctionInfo` from `state()`");
}
```
To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `AuctionInfo` state. For example - [dutch-auction/state](https://github.com/gear-foundation/dapps/tree/master/contracts/dutch-auction/state):

```rust title="dutch-auction/state/src/lib.rs"
#[gmeta::metawasm]
pub mod metafns {
    pub type State = AuctionInfo;

    pub fn info(mut state: State) -> AuctionInfo {
        if matches!(state.status, Status::IsRunning) && exec::block_timestamp() >= state.expires_at
        {
            state.status = Status::Expired
        }
        state
    }
}
```

## Source code

The source code of this example of Dutch Auction program and the example of an implementation of its testing is available on [gear-foundation/dapp/contracts/dutch-auction](https://github.com/gear-foundation/dapps/tree/master/contracts/dutch-auction).

See also an example of the program testing implementation based on `gtest`: [gear-foundation/dapps/dutch-auction/tests](https://github.com/gear-foundation/dapps/tree/master/contracts/dutch-auction/tests).

For more details about testing smart programs written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
