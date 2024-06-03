---
sidebar_label: Base Marketplace
sidebar_position: 1
---

# NFT Marketplace

![img alt](../../img/nft-marketplace.png)

NFT marketplace is a program where you can buy and sell non-fungible tokens for fungible tokens. The program also supports holding the NFT auctions and making/accepting purchase offers on NFTs.

The following are program examples available on GitHub: 

- [Gear Non-Fungible Token](https://github.com/gear-foundation/dapps/tree/master/contracts/non-fungible-token).
- [NFT marketplace](https://github.com/gear-foundation/dapps/tree/master/contracts/nft-marketplace).
- Marketplace UI available on [Github](https://github.com/gear-foundation/dapps/tree/master/frontend/apps/nft-marketplace)

Anyone can easily create their own NFT marketplace application and run it on Gear-powered Networks. 

## How to run

### ⚒️ Build programs

- Build [NFT contract](https://github.com/gear-foundation/dapps/tree/master/contracts/non-fungible-token) as described in `README.md`
- Build [Marketplace program](https://github.com/gear-foundation/dapps/tree/master/contracts/nft-marketplace) as described in `README.md`

### 🏗️ Upload programs

You can deploy a program using [idea.gear-tech.io](https://idea.gear-tech.io/). In the network selector, choose `Staging Testnet` or `Development` (in this case, you should have a local node running).

**Non-Fungible Token**

1. Upload program `nft.opt.wasm` from `/target/wasm32-unknown-unknown/release/`
2. Upload metadata file `meta.txt`
3. Specify `init payload` and calculate gas!

:::info
Init payload:
- name `Str` - NFT collection name
- symbol `Str` - NFT collection symbol
- base_uri `Str` - NFT collection base URI
- royalties `Option<Royalties>` - Optional param to specify accounts to pay royalties
:::

**Marketplace**

1. Upload program `marketplace.opt.wasm` from `/target/wasm32-unknown-unknown/release/`
2. Upload metadata file `meta.txt`
3. Specify `init payload` and calculate gas!

:::info
InitMarket payload:

- admin_id (ActorId) -  marketplace admin
- treasury_id (ActorId) - an account that receives a commission from sales on the marketplace
- treasury_fee (U16) -  sales commission
:::

### 🖥️ Run UI

1. Install packages

```sh
yarn install
```

2. Configure .evn file. Specify network address and program ID like in the example below:

For proper application functioning, one needs to adjust an environment variable parameters. An example is available [here](https://github.com/gear-foundation/dapps/blob/master/frontend/apps/nft-marketplace/.env.example).

```sh
REACT_APP_NODE_ADDRESS=wss://testnet.vara.network:443
REACT_APP_IPFS_ADDRESS=https://ipfs.gear-tech.io/api/v0
REACT_APP_IPFS_GATEWAY_ADDRESS=https://ipfs-gw.gear-tech.io/ipfs
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=0xf8e5add537887643f8aa1ee887754d9b2d8c20d4efd062d6c1dc673cbe390d6f
REACT_APP_NFT_CONTRACT_ADDRESS=0xa7874ff27e9bac10bf7fd43f4908bb1e273018e15325c16fb35c71966c0c4033
```

- `REACT_APP_NODE_ADDRESS` is Gear Network address (`wss://testnet.vara.network`)
- `REACT_APP_IPFS_ADDRESS` is address of IPFS to store NFT assets (https://ipfs.gear-tech.io/api/v0 was used for Gear Marketplace implementation)
- `REACT_APP_IPFS_GATEWAY_ADDRESS` is IPFS Gateway address (https://ipfs-gw.gear-tech.io/ipfs)
- `REACT_APP_MARKETPLACE_CONTRACT_ADDRESS` is NFT Marketplace program address in Gear Network
- `REACT_APP_NFT_CONTRACT_ADDRESS` is Gear Non-Fungible Token contract address in Gear Network

3. Run app

```sh
yarn start
```

## Marketplace program logic

This article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios.

[//]: # (You can watch a video on how to get the NFT Marketplace application up and running and its capabilities here: **https://youtu.be/4suveOT3O-Y**.)

## Logic
The program state:
```rust title="nft-marketplace/io/src/lib.rs"
pub struct Market {
    pub admin_id: ActorId,
    pub treasury_id: ActorId,
    pub treasury_fee: u16,
    pub items: BTreeMap<(ContractId, TokenId), Item>,
    pub approved_nft_contracts: BTreeSet<ActorId>,
    pub approved_ft_contracts: BTreeSet<ActorId>,
    pub tx_id: TransactionId,
}
```
- `admin_id` - an account who has the right to approve non-fungible-token and fungible-tokens contracts that can be used in the marketplace program;
- `treasury_id` - an account to which sales commission will be credited;
- `treasury_fee` - commission percentage (from 1 to 5 percent)

The marketplace program is initialized with the following fields;

- `items` - listed NFTs;
- `approved_nft_contracts` - NFT contracts accounts that can be listed on the marketplace;
- `approved_ft_contracts` - fungible token accounts for which it is possible to buy marketplace items;
- `tx_id` - the id for tracking transactions in the fungible and non-fungible contracts (See the description of [fungible token](/examples/Standards/gft-20.md) and [non-fungible token](/examples/Standards/gnft-721.md)).


The marketplace item has the following struct:
```rust title="nft-marketplace/io/src/lib.rs"
pub struct Item {
    pub token_id: TokenId,
    pub owner: ActorId,
    pub ft_contract_id: Option<ContractId>,
    pub price: Option<Price>,
    pub auction: Option<Auction>,
    pub offers: BTreeMap<(Option<ContractId>, Price), ActorId>,
    pub tx: Option<(TransactionId, MarketTx)>,
}
```
- `token_id` is the ID of the NFT within its contract.
- `owner` - an item owner;
- `ft_contract_id` - a contract of fungible tokens for which that item can be bought. If that field is `None` then the item is on sale for native Gear value;
- `price` - the item price. `None` field means that the item is not on the sale;
- `auction` - a field containing information on the current auction. `None` field means that there is no current auction on the item;
- `offers` - purchase offers made on that item;
- `tx` - a pending transaction on the item. `None` means that there are no pending transactions.

`MarketTx` is an enum of possible transactions that can occur with NFT:

```rust title="nft-marketplace/io/src/lib.rs"
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

To list NFTs on the marketplace or modify the terms of sale, send the following message:

```rust title="nft-marketplace/io/src/lib.rs"
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

To buy NFTs, send the following message:

```rust title="nft-marketplace/io/src/lib.rs"
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

The marketplace program includes the *English auction*. *English auction* is an open auction at an increasing price, where participants openly bid against each other, with each subsequent bid being greater than the previous one.

The auction has the following struct:
```rust title="nft-marketplace/io/src/lib.rs"
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

```rust title="nft-marketplace/io/src/lib.rs"
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

Send the following message to add a bid to the currency auction:
```rust title="nft-marketplace/io/src/lib.rs"
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

If the auction period is over, anyone can send the message `SettleAuction` that will send the NFT to the winner and pay the owner:

```rust title="nft-marketplace/io/src/lib.rs"
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

Send the following message to make an offer on the marketplace item:

```rust title="nft-marketplace/io/src/lib.rs"
/// Adds a price offer to the item.
///
/// Requirements:
/// * NFT items must exist and be listed on the marketplace.
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
    price: Price,
},
```

The item owner can accept the offer:

```rust title="nft-marketplace/io/src/lib.rs"
/// Accepts an offer.
///
/// Requirements:
/// * NFT items must exist and be listed on the marketplace.
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

The user who made the offer can also withdraw their tokens:

```rust title="nft-marketplace/io/src/lib.rs"
/// Withdraws tokens.
///
/// Requirements:
/// * NFT items must exist and be listed on the marketplace.
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
## Consistency of program states

The `market` program interfaces with both `fungible` and `non-fungible` token contracts. Each transaction that alters the states of multiple programs is temporarily stored until its completion. Whenever a user engages with an item, the marketplace program verifies any pending transactions. If there is one, it prompts the user to finalize it, preventing the initiation of a new transaction. The idempotency inherent in the token contracts enables the restarting of a transaction without redundant changes, ensuring the consistent state of all three programs.

## Program metadata and state

Metadata interface description:

```rust title="nft-marketplace/io/src/lib.rs"
pub struct MarketMetadata;

impl Metadata for MarketMetadata {
    type Init = In<InitMarket>;
    type Handle = InOut<MarketAction, MarketEvent>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = Out<Market>;
}
```

To display the full program state information, the `state()` function is used:

```rust title="nft-marketplace/src/lib.rs"
#[no_mangle]
extern fn state() {
    let market = unsafe { MARKET.as_ref().expect("Uninitialized market state") };
    msg::reply(market, 0).expect("Failed to share state");
}
```

To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `Market` state. For example - [gear-foundation/dapps-nft-marketplace/state](https://github.com/gear-foundation/dapps/tree/master/contracts/nft-marketplace/state):

```rust title="nft-marketplace/state/src/lib.rs"
#[gmeta::metawasm]
pub mod metafns {
    pub type State = Market;

    pub fn all_items(state: State) -> Vec<Item> {
        nft_marketplace_io::all_items(state)
    }

    pub fn item_info(state: State, args: ItemInfoArgs) -> Option<Item> {
        nft_marketplace_io::item_info(state, &args)
    }
}
```
