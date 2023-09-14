---
sidebar_label: Dutch Auction
sidebar_position: 11
---

# Dutch auction

## Introduction
A Dutch auction is one of several types of auctions for buying or selling goods. Most commonly, it means an auction in which the auctioneer begins with a high asking price in the case of selling, and lowers it until some participant accepts the price, or it reaches a predetermined reserve price. A Dutch auction has also been called a clock auction or open-outcry descending-price auction. This type of auction shows the advantage of speed since a sale never requires more than one bid.

The auction uses [Gear non-fungible tokens (gNFT)](gnft-721.md) as tradable goods.

The article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own application and run it on the Gear Network. The source code is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/dutch-auction).

## Contract description

### Actions

```rust
pub enum Action {
    Buy,
    Create(CreateConfig),
    ForceStop,
    Reward,
}
```

- `Buy` is an action to buy an GNFT token by current price
- `Create(CreateConfig)` is an action to create a new auction if the previous one is over or if it's the first auction in this contract.<br/>
- `ForceStop` is an action to force stop an auction if contract owner would prefer to finish it ahead of time

>Note how DutchAuction is composed; that allows users to reuse its functionality over and over again.

#### Structures in actions:

```rust
pub struct CreateConfig {
    pub nft_contract_actor_id: ActorId,
    pub token_owner: ActorId,
    pub token_id: U256,
    pub starting_price: u128,
    pub discount_rate: u128,
    pub duration: Duration,
}
```
**To create a new auction you need to have these fields:**
- `nft_contract_actor_id` is a contract address where auctioneers NFT had been minted
- `token_owner` is an address of token owner to send him a reward if someone bought his NFT
- `token_id` is an id of NFT in its contract
- `starting_price` is the price at which the auction starts and starts descending
- `discount_rate` is the amount by which the price will decrease per millisecond over time
- `duration` is a property is needed to set the duration of the auction

```rust
pub struct Duration {
    pub days: u64,
    pub hours: u64,
    pub minutes: u64,
}
```

- `days` amount of days in period
- `hours` amount of hours in period
- `minutes` amount of minutes in period

### Events

```rust
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
- `AuctionStoped` is an event that occurs when contract owner forcibly ends the auction

## Consistency of contract states
The `Dutch auction` contract interacts with the `non-fungible` token contract. Each transaction that changes the states of Dutch Auction and the non-fungible token is stored in the state until it is completed. User can complete a pending transaction by sending a message exactly the same as the previous one with indicating the transaction id. The idempotency of the non-fungible token contract allows to restart a transaction without duplicate changes which guarantees the state consistency of these 2 contracts.

### Programm metadata and state
Metadata interface description:

```rust
pub struct AuctionMetadata;

impl Metadata for AuctionMetadata {
    type Init = ();
    type Handle = InOut<Action, Event>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = AuctionInfo;
}
```
To display the full contract state information, the `state()` function is used:

```rust
#[no_mangle]
extern "C" fn state() {
    reply(common_state()).expect(
        "Failed to encode or reply with `<AuctionMetadata as Metadata>::State` from `state()`",
    );
}
```
To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `AuctionInfo` state. For example - [dutch-auction/state](https://github.com/gear-foundation/dapps/tree/master/contracts/dutch-auction/state):

```rust
#[metawasm]
pub mod metafns {
    pub type State = <AuctionMetadata as Metadata>::State;

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

The source code of this example of Dutch Auction smart contract and the example of an implementation of its testing is available on [gear-foundation/dapps/dutch-auction](https://github.com/gear-foundation/dapps/tree/master/contracts/dutch-auction).

See also an example of the smart contract testing implementation based on `gtest`: [dutch-auction/tests](https://github.com/gear-foundation/dapps/tree/master/contracts/dutch-auction/tests).

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
