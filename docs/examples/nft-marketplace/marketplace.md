---
sidebar_label: Base Marketplace
sidebar_position: 1
---

# NFT Marketplace

## Introduction

NFT marketplace is a contract where you can buy and sell non-fungible tokens for fungible tokens. The contract also supports holding the NFT auctions and making/accepting purchase offers on NFTs.

A smart contract examples created by Gear are available on GitHub so anyone can easily create their own NFT marketplace application and run it on the Gear Network:
- [Gear Non-Fungible Token](https://github.com/gear-dapps/non-fungible-token/). 
- [NFT marketplace](https://github.com/gear-dapps/nft-marketplace).

This article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios.

Gear also [provides](https://github.com/gear-tech/gear-js/tree/master/apps/marketplace) an example implementation of the NFT Marketplace's user interface to demonstrate its interaction with smart contracts in the Gear Network.

<!-- You can watch a video on how to get the NFT Marketplace application up and running and its capabilities here: **https://youtu.be/4suveOT3O-Y**.
-->
To use the hashmap you should include `hashbrown` package into your *Cargo.toml* file:
```toml
[dependecies]
# ...
hashbrown = "0.13.1"
```

## Logic
The contract state:
```rust
use hashbrown::{HashMap, HashSet};

pub struct Market {
    pub admin_id: ActorId,
    pub treasury_id: ActorId,
    pub treasury_fee: u128,
    pub items: HashMap<ContractAndTokenId, Item>,
    pub approved_nft_contracts: HashSet<ActorId>,
    pub approved_ft_contracts: HashSet<ActorId>,
    pub tx_id: TransactionId,
}
```
- `admin_id` - an account who has the right to approve non-fungible-token and fungible-tokens contracts that can be used in the marketplace contract;
- `treasury_id` - an account to which sales commission will be credited;
- `treasury_fee` - 
commission percentage (from 1 to 5 percent)
The marketplace contract is initialized with the following fields;
- `items` - listed NFTs;
- `approved_nft_contracts` - nft contracts accounts that can be listed on the marketplace;
- `approved_ft_contracts` - 
fungible token accounts for which it is possible to buy marketplace items;
- `tx_id` - the id for tracking transactions in the fungible and non-fungible contracts (See the description of [fungible token](/examples/gft-20.md) and [non-fungible token](/examples/gnft-721.md)).


The marketplace item has the following struct:
```rust
pub struct Item {
    pub owner: ActorId,
    pub ft_contract_id: Option<ContractId>,
    pub price: Option<Price>,
    pub auction: Option<Auction>,
    pub offers: BTreeMap<(Option<ContractId>, Price), ActorId>,
    pub tx: Option<(TransactionId, MarketTx)>,
}
```
- `owner` - an item owner;
- `ft_contract_id` - a contract of fungible tokens for which that item can be bought. If that field is `None` then the item is on sale for native Gear value;
- `price` - 
the item price. `None` field means that the item is not on the sale;
- `auction` - 
a field containing information on the current auction. `None` field means that there is no current auction on the item;
- `offers` - 
purchase offers made on that item;
- `tx` - a pending transaction on the item. `None` means that there is no pending transactions. 

`MarketTx` is an enum of possible transactions that can occur with NFT:

```rust
#[derive(Debug, Encode, Decode, TypeInfo, Clone, PartialEq, Eq)]
pub enum MarketTx {
    CreateAuction,
    Bid {
        account: ActorId,
        price: Price,
    },
    SettleAuction,
    Sale {
        buyer: ActorId,
    },
    Offer {
        ft_id: ContractId,
        price: Price,
        account: ActorId,
    },
    AcceptOffer,
    Withdraw {
        ft_id: ContractId,
        price: Price,
        account: ActorId,
    },
}
```
### Listing NFTs, changing the price or stopping the sale.
To list NFT on the marketplace or modify the terms of sale send the following message: 
```rust
/// Adds data on market item.
/// If the item of that NFT does not exist on the marketplace then it will be listed.
/// If the item exists then that action is used to change the price or suspend the sale.
///
/// # Requirements
/// * [`msg::source()`](gstd::msg::source) must be the NFT owner
/// * `nft_contract_id` must be added to `approved_nft_contracts`
/// * if item already exists, then it cannot be changed if there is an active auction
///
/// On success replies [`MarketEvent::MarketDataAdded`].
AddMarketData {
    /// the NFT contract address
    nft_contract_id: ContractId,
    /// the fungible token contract address (If it is `None` then the item is traded for the native value)
    ft_contract_id: Option<ContractId>,
    /// the NFT id
    token_id: TokenId,
    /// the NFT price (if it is `None` then the item is not on the sale)
    price: Option<Price>,
}
```
### NFT purchase.
To buy NFT send the following message: 

```rust
/// Sells the NFT.
/// 
/// # Requirements:
/// * The NFT item must exist and be on sale.
/// * If the NFT is sold for a native Gear value, then a buyer must attach a value equal to the price.
/// * If the NFT is sold for fungible tokens then a buyer must have enough tokens in the fungible token contract.
/// * There must be no open auction on the item.
/// 
/// On success replies [`MarketEvent::ItemSold`].
BuyItem {
    /// NFT contract address
    nft_contract_id: ContractId,
    /// the token ID
    token_id: TokenId,
}
```

### NFT auction.
The marketplace contract includes the *English auction*. *English auction* is an open auction at an increasing price, where participants openly bid against each other, with each subsequent bid being greater than the previous one.

The auction has the following struct:
```rust
pub struct Auction {
    pub bid_period: u64,
    pub started_at: u64,
    pub ended_at: u64,
    pub current_price: Price,
    pub current_winner: ActorId,
}
```
- `bid_period` - the time interval. If the auction ends before `exec::blocktimestamp() + bid_period` then the auction end time is delayed for `bid_period`;
- `started_at` - auction start time;
- `ended_at` - auction end time;
- `current_price` - the current offered price for the NFT;
- `current_winner` - the current auction winner

The auction is started with the following message:

```rust
/// Creates an auction for selected item.
/// If the NFT item doesn't exist on the marketplace then it will be listed
///
/// Requirements:
/// * Only the item owner can start the auction.
/// * `nft_contract_id` must be in the list of `approved_nft_contracts`
/// *  There must be no active auction
/// 
/// On success replies [`MarketEvent::AuctionCreated`].
CreateAuction {
    /// the NFT contract address
    nft_contract_id: ContractId,
    /// the fungible token contract address (If it is `None` then the item is traded for the native value)
    ft_contract_id: Option<ContractId>,
    /// the NFT id
    token_id: TokenId,
    /// the starting price
    min_price: Price,
    /// the time interval the auction is extended if bid is made if the auction ends before `exec::blocktimestamp() + bid_period`
    bid_period: u64,
    /// the auction duration
    duration: u64,
},
```

To add bid to the current auction send the following message:
```rust
/// Adds a bid to an ongoing auction.
/// 
/// # Requirements:
/// * The item must exist.
/// * The auction must exist on the item.
/// * If the NFT is sold for a native Gear value, then a buyer must attach a value equal to the price indicated in the arguments.
/// * If the NFT is sold for fungible tokens then a buyer must have   enough tokens in the fungible token contract.
/// * `price` must be greater than the current offered price for that item.
///  
/// On success replies [`MarketEvent::BidAdded`].
AddBid {
    /// the NFT contract address
    nft_contract_id: ContractId,
    /// * `token_id`: the NFT id
    token_id: TokenId,
    /// the offered price
    price: Price,
},
```

If auction period is over then anyone can send message `SettleAuction` that will send the NFT to the winner and pay to the owner:
```rust
/// Settles the auction.
/// 
/// Requirements:
/// * The auction must be over.
///   
/// On successful auction replies [`MarketEvent::AuctionSettled`].
/// If no bids were made replies [`MarketEvent::AuctionCancelled`].
SettleAuction {
    /// the NFT contract address
    nft_contract_id: ContractId,
    /// the NFT id
    token_id: TokenId,
}
```

### Offers.
To make offer on the marketplace item send the following message:
```rust
/// Adds a price offer to the item.
/// 
/// Requirements:
/// * NFT item must exists and be listed on the marketplace.
/// * There must be no ongoing auction on the item.
/// * If a user makes an offer in native Gear value, then he must attach a value equal to the price indicated in the arguments.
/// * If a user makes an offer in fungible tokens then he must have  enough tokens in the fungible token contract.
/// * The price can not be equal to 0.
/// * There must be no identical offers on the item.
///     
/// On success replies [`MarketEvent::OfferAdded`].
AddOffer {
    /// the NFT contract address
    nft_contract_id: ContractId,
    /// the FT contract address (if it is `None, the offer is made for the native value)
    ft_contract_id: Option<ContractId>,
    /// the NFT id
    token_id: TokenId,
    /// the offer price
    price: u128,
},
```
The item owner can accept the offer:
```rust
/// Accepts an offer.
/// 
/// Requirements:
/// * NFT item must exist and be listed on the marketplace.
/// * Only the owner can accept the offer.
/// * There must be no ongoing auction.
/// * The offer with indicated hash must exist.
///      
/// On success replies [`MarketEvent::OfferAccepted`].
AcceptOffer {
    /// the NFT contract address
    nft_contract_id: ContractId,
    /// the NFT id
    token_id: TokenId,
    /// the fungible token contract address
    ft_contract_id: Option<ContractId>,
    /// the offer price
    price: Price,
}
```
The user who made the offer can also withdraw his tokens:

```rust
/// Withdraws tokens.
/// 
/// Requirements:
/// * NFT item must exist and be listed on the marketplace.
/// * Only the offer creator can withdraw his tokens.
/// * The offer with indicated hash must exist.
/// 
/// On success replies [`MarketEvent::TokensWithdrawn`].
Withdraw {
    /// the NFT contract address
    nft_contract_id: ContractId,
    /// the FT contract address (if it is `None, the offer is made for the native value)
    ft_contract_id: Option<ContractId>,
    /// the NFT id
    token_id: TokenId,
    /// The offered price (native value)
    price: Price,
},
```
## Consistency of contract states
The `market` contract interacts with `fungible` and `non-fungible` token contracts. Each transaction that changes the states of several contracts is stored in the state until it is completed. Every time a user interacts with an item, the marketplace contract checks for an pending transaction and, if there is one, asks the user to complete it, not allowing to start a new one. The idempotency of the token contracts allows to restart a transaction without duplicate changes what guarantees the state consistency of 3 contracts.
## User interface

A Ready-to-Use application example provides a user interface that interacts with [gNFT](https://github.com/gear-dapps/non-fungible-token/tree/master/nft) and [Marketplace](https://github.com/gear-dapps/nft-marketplace) smart contracts running in Gear Network.
- Gear Non-Fundible Token contract enables creation of NFT tokens, proves an ownership of a digital assets, check [this article](../gnft-721) for details.
- NFT Marketplace contract enables to buy and sell non-fungible tokens for fungible tokens, hold the NFT auctions and make/accept purchase offers on NFTs.

<!-- This video demonstrates how to configure and run Markeplace application on your own and explains the user interaction workflow: **https://youtu.be/4suveOT3O-Y** 
-->

![img alt](./../img/nft-marketplace.png)

An NFT Marketplace application source code is available on [GitHub](https://github.com/gear-tech/gear-js/tree/master/apps/marketplace).

### Configure basic dApp in .env:

For proper application functioning, one needs to adjust an environment variable parameters. An example is available [here](https://github.com/gear-tech/gear-js/blob/master/apps/marketplace/.env.example).

```sh
REACT_APP_NODE_ADDRESS
REACT_APP_IPFS_ADDRESS
REACT_APP_IPFS_GATEWAY_ADDRESS
REACT_APP_NFT_CONTRACT_ADDRESS
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS
```

- `REACT_APP_NETWORK` is Gear Network address (wss://rpc-node.gear-tech.io:443)
- `REACT_APP_IPFS_ADDRESS` is address of IPFS to store NFT assets (https://ipfs.gear-tech.io/api/v0 was used for Gear Marketplace implementation)
- `REACT_APP_IPFS_GATEWAY_ADDRESS` is IPFS Gateway address (https://ipfs-gw.gear-tech.io/ipfs)
- `REACT_APP_NFT_CONTRACT_ADDRESS` is Gear Non-Fungible Token contract address in Gear Network
- `REACT_APP_MARKETPLACE_CONTRACT_ADDRESS` is NFT Marketplace contract address in Gear Network

### Simple NFT

Another example of an interface that demonstrates how to work with a smart contract is a Simple NFT application example that is available on [GitHub](https://github.com/gear-tech/gear-js/tree/master/apps/nft).

It implements the ability to mint NFTs, view all NFTs minted by any account in the contract, as well as view NFTs that someone has approved to the current account (`AprovedToMe`) with the possibility of further transfer to another account (this option is not available in the full NFT Marketplace application).

### How to run

Install required dependencies:
```sh
npm install
```

Run the app in the development mode:
```sh
npm start
```
Open http://localhost:3000 to view it in the browser.

## Source code

The source code of this example of NFT marketplace smart contract and the example of an implementation of its testing is available on [Gear-dapps](https://github.com/gear-dapps/nft-marketplace).

The Gear JS application code is available in [Gear-tech/gear-js](https://github.com/gear-tech/gear-js/tree/master/apps/marketplace).

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
