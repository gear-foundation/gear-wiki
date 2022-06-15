---
sidebar_label: NFT Marketplace
sidebar_position: 10
---

# NFT Marketplace

## Introduction
NFT marketplace is a contract where you can buy and sell non-fungible tokens for fungible tokens or Gear native value. The contract also supports holding the NFT auctions and making/accepting purchase offers on NFTs.
## Logic
The contract state:
```rust
pub struct Market {
    pub admin_id: ActorId,
    pub treasury_id: ActorId,
    pub treasury_fee: u128,
    pub items: BTreeMap<ContractAndTokenId, Item>,
    pub approved_nft_contracts: BTreeSet<ActorId>,
    pub approved_ft_contracts: BTreeSet<ActorId>,
}
```
- `admin_id` - an account who has the right to approve non-fungible-token and fungible-tokens contracts that can be used in the marketplace contract;
- `treasury_id` - an account to which sales commission will be creadited;
- `treasury_fee` - 
commission percentage (from 1 to 5 percent)
The marketplace contract is initialized with the following fields;
- `items` - listed NFTs;
- `approved_nft_contracts` - nft contracts accounts that can be listed on the marketplace;
- `approved_ft_contracts` - 
fungible token accounts for which it is possible to buy marketplace items;

The makretplace item has the following struct:
```rust
pub struct Item {
    pub owner_id: ActorId,
    pub ft_contract_id: Option<ActorId>,
    pub price: Option<u128>,
    pub auction: Option<Auction>,
    pub offers: Vec<Offer>,
}
```
- `owner_id` - an item owner;
- `ft_contract_id` - a contract of fungible tokens for which that item can be bought. If that field is `None` then the item is on sale for native Gear value;
- `price` - 
the item price. `None` field means that the item is not on the sale;
- `auction` - 
a field containing information on the current auction. `None` field means that there is no current auction on the item;
- `offers` - 
purchase offers made on that item;

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
/// Arguments:
/// * `nft_contract_id`: the NFT contract address
/// * `token_id`: the NFT id
/// * `price`: the NFT price (if it is `None` then the item is not on the sale)
///
/// /// On success replies [`MarketEvent::MarketDataAdded`].
AddMarketData {
    nft_contract_id: ActorId,
    ft_contract_id: Option<ActorId>,
    token_id: U256,
    price: Option<u128>,
}
```
### NFT purchase.
To buy NFT send the following message: 

```rust
/// Sells the NFT.
/// 
/// # Requirements:
/// * The NFT item must exists and be on sale.
/// * If the NFT is sold for a native Gear value, then a buyer must attach value equals to the price.
/// * If the NFT is sold for fungible tokens then a buyer must have enough tokens in the fungible token contract.
/// * There must be no an opened auction on the item.
/// 
/// Arguments:
/// * `nft_contract_id`: NFT contract address
/// * `token_id`: the token ID
/// 
/// On success replies [`MarketEvent::ItemSold`].
BuyItem {
    nft_contract_id: ActorId,
    token_id: U256,
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
    pub current_price: u128,
    pub current_winner: ActorId,
}
```
- `bid_period` - the time interval. If the auction ends before `exec::blocktimestamp() + bid_period` then the auction end time is delayed for `bid_period`;
- `started_at` - auction start time;
- `ended_at` - auction end time;
- `current_price` - the current offered price for the NFT;
- `current_winner` - the current auction winner

The auction is started with the following messsage:

```rust
/// Creates an auction for selected item.
/// If the NFT item doesn't exist on the marketplace then it will be listed
///
/// Requirements:
/// * Only the item owner can start auction.
/// * `nft_contract_id` must be in the list of `approved_nft_contracts`
/// *  There must be no active auction.
///
/// Arguments:
/// * `nft_contract_id`: the NFT contract address
/// * `ft_contract_id`: the fungible token contract address that can be used for trading
/// * `token_id`: the NFT id
/// * `min_price`: the starting price
/// * `bid_period`: the time interval. If the auction ends before `exec::blocktimestamp() + bid_period`
/// then the auction end time is delayed for `bid_period`.
/// 
/// On success replies [`MarketEvent::AuctionCreated`].
CreateAuction {
    nft_contract_id: ActorId,
    ft_contract_id: Option<ActorId>,
    token_id: U256,
    min_price: u128,
    bid_period: u64,
    duration: u64,
},
```

To add bid to the current auction send the following message:
```rust
/// Adds a bid to an ongoing auction.
/// 
/// # Requirements:
/// * The item must extsts.
/// * The auction must exists on the item.
/// * If the NFT is sold for a native Gear value, then a buyer must attach value equals to the price indicated in the arguments.
/// * If the NFT is sold for fungible tokens then a buyer must have   enough tokens in the fungible token contract.
/// * `price` must be greater then the current offered price for that item.
/// 
/// # Arguments
/// * `nft_contract_id`: the NFT contract address.
/// * `token_id`: the NFT id.
/// * `price`: the offered price.
///  
/// On success replies [`MarketEvent::BidAdded`].
AddBid {
    nft_contract_id: ActorId,
    token_id: U256,
    price: u128,
},
```

If auction period is over then anyone can send message `SettleAuction` that will send the NFT to the winner and pay to the owner:
```rust
/// Settles the auction.
/// 
/// Requirements:
/// * The auction must be over.
/// 
/// Arguments:
/// * `nft_contract_id`: the NFT contract address
/// * `token_id`: the NFT id
///   
/// On successful auction replies [`MarketEvent::AuctionSettled`].
/// If no bids were made replies [`MarketEvent::AuctionCancelled`].
SettleAuction {
    nft_contract_id: ActorId,
    token_id: U256,
}
```

### Offers.
To make offer on the marketplace item send the following message:
```rust
/// Adds a price offer to the item.
/// 
/// Requirements:
/// * NFT item must exists and be listed on the marketplace.
/// * There must be no an ongoing auction on the item.
/// * If a user makes an offer in native Gear value, then he must attach value equals to the price indicated in the arguments.
/// * If a user makes an offer in fungible tokens then he must have  enough tokens in the fungible token contract.
/// * The price can not be equal to 0.
/// * There must be no identical offers on the item.
/// 
/// Arguments:
/// * `nft_contract_id`: the NFT contract address
/// * `ft_contract_id`: the FT contract address
/// * `token_id`: the NFT id
/// * `price`: the offer price
///     
/// On success replies [`MarketEvent::OfferAdded`].
AddOffer {
    nft_contract_id: ActorId,
    ft_contract_id: Option<ActorId>,
    token_id: U256,
    price: u128,
},
```
The item owner can accept the offer:
```rust
/// Accepts an offer.
/// 
/// Requirements:
/// * NFT item must exists and be listed on the marketplace.
/// * Only owner can accept offer.
/// * There must be no ongoing auction.
/// * The offer with indicated hash must exist.
/// 
/// Arguments:
/// * `nft_contract_id`: the NFT contract address
/// * `token_id`: the NFT id
/// * `offer_hash`: the offer hash that includes the offer price and the address of fungible token contract.
///      
/// On success replies [`MarketEvent::OfferAccepted`].
AcceptOffer {
    nft_contract_id: ActorId,
    token_id: U256,
    offer_hash: H256,
}
```
The user who made the offer can also withdraw his tokens:

```rust
/// Withdraws tokens.
/// 
/// Requirements:
/// * NFT item must exists and be listed on the marketplace.
/// * Only the offer creator can withdraw his tokens.
/// * The offer with indicated hash must exist.
/// 
/// Arguments:
/// * `nft_contract_id`: the NFT contract address
/// * `token_id`: the NFT id
/// * `offer_hash`: the offer hash that includes the offer price and the address of fungible token contract.
/// 
/// On success replies [`MarketEvent::TokensWithdrawn`].
Withdraw {
    nft_contract_id: ActorId,
    token_id: U256,
    hash: H256,
},
```
## Source code

The source code of this example of NFT marketplace smart contract and the example of an implementation of its testing is available on [GitHub](https://github.com/gear-dapps/non-fungible-token/tree/master/nft-marketplace).


For more details about testing smart contracts written on Gear, refer to the [Program Testing](/developing-contracts/testing) article.
