---
sidebar_label: '供应链'
sidebar_position: 10
---

# What is a supply chain?

In logistics, a supply chain is a system for tracking and delivering to an end consumer various items. As a rule, such systems can't work without a lot of paperwork and other layers of bureaucracy. All of this costs a lot of time and money and increases the likelihood of an accidental error or, worst of all, a fraud. With the help of smart contract and blockchain technologies, it is possible to eliminate these problems by making a supply chain more efficient, reliable and transparent.

So here's the example of a supply chain smart contract.


## Logic
* Each newly produced item gets the NFT (in Gear's context - [GNFT token](gnft-721.md) and an ID equal to the ID of its NFT. Then, as an item moves along a supply chain, an item's NFT transfers between a supply chain program, item's producer, and future distributor, retailer and end consumer.
* Anyone who knows an item's ID can get item info.
* Sale, purchase, delivery is made in [GFT tokens](gft-20.md).

Item info has the following struct:
```rust
struct ItemInfo {
    name: String,
    notes: String,
    producer: ActorId,
    distributor: ActorId,
    retailer: ActorId,
    state: ItemState,
}
```

And `ItemState` has the following enum:
```rust
enum ItemState {
    Produced,
    ForSaleByProducer,
    PurchasedByDistributor,
    ShippedByProducer,
    ReceivedByDistributor,
    ProcessedByDistributor,
    PackagedByDistributor,
    ForSaleByDistributor,
    PurchasedByRetailer,
    ShippedByDistributor,
    ReceivedByRetailer,
    ForSaleByRetailer,
    PurchasedByConsumer,
}
```

## Interface
### Initialization config
```rust
struct InitSupplyChain {
    producers: BTreeSet<ActorId>,
    distributors: BTreeSet<ActorId>,
    retailers: BTreeSet<ActorId>,

    ft_program_id: ActorId,
    nft_program_id: ActorId,
}
```

### Functions
```rust
async fn produce_item(&mut self, name: String, notes: String)
```
Produces one item with a name and notes and replies with its ID.
Transfers created NFT for an item to a producer.

Requirements:
* `msg::source()` must be a producer in a supply chain.

Arguments:
* `name`: an item's name.
* `notes`: an item's notes.

```rust
async fn put_up_for_sale_by_producer(&mut self, item_id: U256, price: u128)
```
Puts an item up for a sale to a distributor for a given price
on behalf of a producer.
Transfers item's NFT to a supply chain.

Requirements:
* `msg::source()` must be a producer in a supply chain
and a producer of this item.
* Item's `ItemState` must be `Produced`.

Arguments:
* `item_id`: an item's ID.
* `price`: an item's price.

```rust
async fn purchase_by_distributor(&mut self, item_id: U256, delivery_time: u64)
```
Purchases an item from a producer on behalf of a distributor.
Transfers tokens for purchasing an item to a supply chain
until an item is received (by the `receive_by_distributor` function).

Requirements:
* `msg::source()` must be a distributor in a supply chain.
* Item's `ItemState` must be `ForSaleByProducer`.

Arguments:
* `item_id`: an item's ID.
* `delivery_time`: a time in seconds for which a producer must deliver an item.
A countdown starts after the `ship_by_producer` function is executed.

```rust
fn ship_by_producer(&mut self, item_id: U256)
```
Starts shipping a purchased item to a distributor on behalf of a producer.
Starts a countdown for a delivery time specified in the
`purchase_by_distributor` function.

Requirements:
* `msg::source()` must be a producer in a supply chain
and a producer of this item.
* Item's `ItemState` must be `PurchasedByDistributor`.

Arguments:
* `item_id`: an item's ID.

```rust
async fn receive_by_distributor(&mut self, item_id: U256)
```
Receives a shipped item from a producer on behalf of a distributor.
Depending on a counted delivery time, transfers tokens for purchasing an item
from a supply chain to a producer or as a penalty for being late refunds some or
all of them to a distributor.
Transfers item's NFT to a distributor.

Requirements:
* `msg::source()` must be a distributor in a supply chain
and a distributor of this item.
* Item's `ItemState` must be `ShippedByProducer`.

Arguments:
* `item_id`: an item's ID.

```rust
fn process_by_distributor(&mut self, item_id: U256)
```
Processes a received item from a producer on behalf of a distributor.

Requirements:
* `msg::source()` must be a distributor in a supply chain
and a distributor of this item.
* Item's `ItemState` must be `ReceivedByDistributor`.

Arguments:
* `item_id`: an item's ID.

```rust
fn package_by_distributor(&mut self, item_id: U256)
```
Packages a processed item on behalf of a distributor.

Requirements:
* `msg::source()` must be a distributor in a supply chain
and a distributor of this item.
* Item's `ItemState` must be `ProcessedByDistributor`.

Arguments:
* `item_id`: an item's ID.

```rust
async fn put_up_for_sale_by_distributor(&mut self, item_id: U256, price: u128)
```
Puts a packaged item up for a sale to a retailer
for a given price on behalf of a distributor.
Transfers item's NFT to a supply chain.

Requirements:
* `msg::source()` must be a distributor in a supply chain
and a distributor of this item.
* Item's `ItemState` must be `PackagedByDistributor`.

Arguments:
* `item_id`: an item's ID.
* `price`: an item's price.

```rust
async fn purchase_by_retailer(&mut self, item_id: U256, delivery_time: u64)
```
Purchases an item from a distributor on behalf of a retailer.
Transfers tokens for purchasing an item to a supply chain
until an item is received (by the `receive_by_retailer` function).

Requirements:
* `msg::source()` must be a retailer in a supply chain.
* Item's `ItemState` must be `ForSaleByDistributor`.

Arguments:
* `item_id`: an item's ID.
* `delivery_time`: a time in seconds for which a distributor must deliver an item.
A countdown starts after the `ship_by_distributor` function is executed.

```rust
fn ship_by_distributor(&mut self, item_id: U256)
```
Starts shipping a purchased item to a retailer on behalf of a distributor.
Starts a countdown for a delivery time specified in the
`purchase_by_retailer` function.

Requirements:
* `msg::source()` must be a distributor in a supply chain
and a distributor of this item.
* Item's `ItemState` must be `PurchasedByRetailer`.

Arguments:
* `item_id`: an item's ID.

```rust
async fn receive_by_retailer(&mut self, item_id: U256)
```
Receives a shipped item from a distributor on behalf of a retailer.
Depending on a counted delivery time, transfers tokens for purchasing an item
from a supply chain to a distributor or as a penalty for being late refunds some or
all of them to a retailer.
Transfers item's NFT to a retailer.

Requirements:
* `msg::source()` must be a retailer in a supply chain
and a retailer of this item.
* Item's `ItemState` must be `ShippedByDistributor`.

Arguments:
* `item_id`: an item's ID.

```rust
async fn put_up_for_sale_by_retailer(&mut self, item_id: U256, price: u128)
```
Puts a received item from a distributor up for a sale to a consumer
for a given price on behalf of a retailer.
Transfers item's NFT to a supply chain.

Requirements:
* `msg::source()` must be a retailer in a supply chain
and a retailer of this item.
* Item's `ItemState` must be `ReceivedByRetailer`.

Arguments:
* `item_id`: an item's ID.
* `price`: an item's price.

```rust
async fn purchase_by_consumer(&mut self, item_id: U256)
```
Purchases an item from a retailer.
Transfers tokens for purchasing an item to its retailer.
Transfers item's NFT to a consumer.

Requirements:
* Item's `ItemState` must be `ForSaleByRetailer`.

Arguments:
* `item_id`: an item's ID.

```rust
fn get_item_info(&mut self, item_id: U256)
```
Gets item info.

Arguments:
* `item_id`: an item's ID.

### Actions & events
**Action** is an enum that is sent to a program and contains info about what it should do. After a successful processing of **Action**, a program replies with the **Event** enum that contains info about a processed **Action** and its result.

```rust
enum SupplyChainAction {
    Produce { name: String, notes: String },
    PutUpForSaleByProducer { item_id: U256, price: u128 },
    PurchaseByDistributor { item_id: U256, delivery_time: u64 },
    ShipByProducer(U256),
    ReceiveByDistributor(U256),
    ProcessByDistributor(U256),
    PackageByDistributor(U256),
    PutUpForSaleByDistributor { item_id: U256, price: u128 },
    PurchaseByRetailer { item_id: U256, delivery_time: u64 },
    ShipByDistributor(U256),
    ReceiveByRetailer(U256),
    PutUpForSaleByRetailer { item_id: U256, price: u128 },
    PurchaseByConsumer(U256),
    GetItemInfo(U256),
}
```

```rust
enum SupplyChainEvent {
    Produced(U256),
    ForSaleByProducer(U256),
    PurchasedByDistributor {
        from: ActorId,
        item_id: U256,
        price: u128,
    },
    ShippedByProducer(U256),
    ReceivedByDistributor {
        from: ActorId,
        item_id: U256,
    },
    ProcessedByDistributor(U256),
    PackagedByDistributor(U256),
    ForSaleByDistributor {
        item_id: U256,
        price: u128,
    },
    PurchasedByRetailer {
        from: ActorId,
        item_id: U256,
        price: u128,
    },
    ShippedByDistributor(U256),
    ReceivedByRetailer {
        item_id: U256,
        from: ActorId,
    },
    ForSaleByRetailer {
        item_id: U256,
        price: u128,
    },
    PurchasedByConsumer {
        from: ActorId,
        item_id: U256,
        price: u128,
    },
    ItemInfo {
        item_id: U256,
        info: ItemInfo,
    },
}
```

## Source code
The source code of this example of a supply chain smart contract and the example of an implementation of its testing is available on [GitHub](https://github.com/gear-tech/apps/blob/master/supply-chain).

For more details about testing smart contracts written on Gear, refer to the [Program testing](/developing-contracts/testing) article.
