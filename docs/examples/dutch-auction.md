---
sidebar_label: Dutch Auction
sidebar_position: 10
---

# Dutch auction

## Introduction
A Dutch auction is one of several types of auctions for buying or selling goods. Most commonly, it means an auction in which the auctioneer begins with a high asking price in the case of selling, and lowers it until some participant accepts the price, or it reaches a predetermined reserve price. A Dutch auction has also been called a clock auction or open-outcry descending-price auction. This type of auction shows the advantage of speed since a sale never requires more than one bid.

The auction uses [Gear non-fungible tokens (gNFT)](/examples/gnft-721) as tradable goods.

The article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own application and run it on the Gear Network. The source code is available on [GitHub](https://github.com/gear-dapps/dutch-auction). 

## Contract description

### Actions

```rust
pub enum Action {
    Buy,
    Create(CreateConfig),
    ForceStop,
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
**To create a new auction you need to have this fields:**
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
    AuctionStoped {
        token_owner: ActorId,
        token_id: U256,
    },
}
```
- `AuctionStarted` is an event that occurs when someone use `Create(CreateConfig)` successfully
- `AuctionStoped` is an event that occurs when contract owner forcibly ends the auction

### State

*Requests:*

```rust
pub enum State {
    TokenPrice(),
    IsActive(),
    Info(),
}
```

- `TokenPrice` is a state to determine the current price of the NFT being sold
- `IsActive` is a state to determine if the auction has been ended
- `Info` is a state which describes an auction to show the user more information

Each state request has a corresponding reply with the same name.

*Replies:*

```rust
pub enum StateReply {
    TokenPrice(u128),
    IsActive(bool),
    Info(AuctionInfo),
}
```

- `TokenPrice` has an associated value with current value in units
- `IsActive` has an associated value which indicate that auction hasn't been ended
- `Info` has an associated value of `AuctionInfo` type

#### Structures in state replies:

```rust
pub struct AuctionInfo {
    pub nft_contract_actor_id: ActorId,
    pub token_id: U256,
    pub token_owner: ActorId,
    pub starting_price: u128,
}
```


- `nft_contract_actor_id` is a contract address where auctioneers NFT had been minted
- `token_id` is an id of NFT in its contract
- `token_owner` is an address of token owner to send him a reward if someone bought his NFT
- `starting_price` is the price at which the auction starts and starts descending

## Source code

The source code of this example of Dutch Auction smart contract and the example of an implementation of its testing is available on [gear-dapps/dutch-auction](https://github.com/gear-dapps/dutch-auction).

See also an example of the smart contract testing implementation based on `gtest`: [gear-dapps/dutch-auction/tree/master/tests](https://github.com/gear-dapps/dutch-auction/tree/master/tests).

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/developing-contracts/testing) article.
