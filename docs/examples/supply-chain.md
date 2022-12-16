---
sidebar_position: 12
---

# Supply chain

## Introduction

In logistics, a supply chain is a system for tracking and delivering to an end consumer various items. As a rule, such systems can't work without a lot of paperwork and other layers of bureaucracy. All of this costs a lot of time and money and increases the likelihood of an accidental error or, worst of all, a fraud. With the help of smart contract and blockchain technologies, it is possible to eliminate these problems by making a supply chain more efficient, reliable and transparent.

The source code of the Supply Chain smart conrtact example is avaialble on [GitHub](https://github.com/gear-dapps/supply-chain).

## Logic

* Each newly produced item gets the NFT (in Gear's context - [Gear non-fungible token (gNFT)](gnft-721.md) and its ID equals an ID of the item. Then, as an item moves along a supply chain, an item's NFT transfers between a supply chain program, item's producer, and future distributor, retailer and end consumer.
* Anyone who knows an item's ID can get item info.
* Sale, purchase, delivery is made in [Gear fungible tokens (gFT)](gft-20.md).

Item info has the following struct:
```rust
pub struct ItemInfo {
    /// An item's producer address.
    pub producer: ActorId,
    /// An address of an item's current or past distributor address (depends on
    /// item's `state`). If it equals [`ActorId::zero()`], then it means that an
    /// item has never had a distributor.
    pub distributor: ActorId,
    /// An address of an item's current or past retailer address (depends on
    /// item's `state`). If it equals [`ActorId::zero()`], then it means that an
    /// item has never had a retailer.
    pub retailer: ActorId,

    pub state: ItemState,
    /// An item's price. If it equals 0, then, depending on item's `state`, an
    /// item is sold for free or has never been put up for sale.
    pub price: u128,
    /// Milliseconds during which a current seller should deliver an item.
    pub delivery_time: u64,
}
```

And `ItemState` has the following enum:
```rust
pub enum ItemState {
    Produced,
    ForSaleByProducer,
    PurchasedByDistributor,
    ApprovedByProducer,
    ShippedByProducer,
    ReceivedByDistributor,
    ProcessedByDistributor,
    PackagedByDistributor,
    ForSaleByDistributor,
    PurchasedByRetailer,
    ApprovedByDistributor,
    ShippedByDistributor,
    ReceivedByRetailer,
    ForSaleByRetailer,
    PurchasedByConsumer,
}
```

## Interface

### Initialization

```rust
/// Initializes the supply chain program.
///
/// # Requirements
/// * Each address of `producers`, `distributors`, and `retailers` mustn't equal
/// [`ActorId::zero()`].
#[derive(Encode, Decode, TypeInfo, Clone)]
pub struct InitSupplyChain {
    /// Addresses that'll have the right to interact with a supply chain on
    /// behalf of a producer.
    pub producers: BTreeSet<ActorId>,
    /// Addresses that'll have the right to interact with a supply chain on
    /// behalf of a distributor.
    pub distributors: BTreeSet<ActorId>,
    /// Addresses that'll have the right to interact with a supply chain on
    /// behalf of a retailer.
    pub retailers: BTreeSet<ActorId>,

    /// A FT program address.
    pub ft_program: ActorId,
    /// An NFT program address.
    pub nft_program: ActorId,
}
```

### Actions

```rust
/// Sends a program info about what it should do.
#[derive(Encode, Decode, TypeInfo)]
pub enum SupplyChainAction {
    /// Produces one item and corresponding NFT with given `token_metadata`.
    ///
    /// Transfers a created NFT for an item to a producer ([`msg::source()`]).
    ///
    /// # Requirements
    /// * [`msg::source()`] must be a producer in a supply chain.
    ///
    /// On success, returns [`SupplyChainEvent::Produced`].
    ///
    /// [`msg::source()`]: gstd::msg::source
    Produce {
        /// Item's NFT metadata.
        token_metadata: TokenMetadata,
    },

    /// Puts a produced item up for sale to a distributor for given `price` on
    /// behalf of a producer.
    ///
    /// Transfers an item's NFT to a supply chain program.
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`](gstd::msg::source) must be a producer of an item in
    /// a supply chain.
    /// * Item's [`ItemState`] must be [`Produced`](ItemState::Produced).
    ///
    /// On success, returns [`SupplyChainEvent::ForSaleByProducer`].
    PutUpForSaleByProducer {
        item_id: ItemId,
        /// An item's price.
        price: u128,
    },

    /// Purchases an item from a producer on behalf of a distributor.
    ///
    /// Transfers fungible tokens for purchasing an item to a supply chain
    /// program until an item is received (by
    /// [`SupplyChainAction::ReceiveByDistributor`]).
    ///
    /// **Note:** An item's producer must approve or not this purchase by
    /// [`SupplyChainAction::ApproveByProducer`].
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`] must be a distributor in a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`ForSaleByProducer`](ItemState::ForSaleByProducer).
    ///
    /// On success, returns [`SupplyChainEvent::PurchasedByDistributor`].
    ///
    /// [`msg::source()`]: gstd::msg::source
    PurchaseByDistributor {
        item_id: ItemId,
        /// Milliseconds during which a producer should deliver an item. A
        /// countdown starts after [`SupplyChainAction::ShipByProducer`] is
        /// executed.
        delivery_time: u64,
    },

    /// Approves or not a distributor's purchase on behalf of a producer.
    ///
    /// If a purchase is approved, then item's [`ItemState`] changes to
    /// [`ApprovedByProducer`](ItemState::ApprovedByProducer) and an item can be
    /// shipped (by [`SupplyChainAction::ShipByProducer`]).
    ///
    /// If a purchase is **not** approved, then fungible tokens for it are
    /// refunded from a supply chain program to a distributor.
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`](gstd::msg::source) must be a producer of an item in
    /// a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`PurchasedByDistributor`](ItemState::PurchasedByDistributor).
    ///
    /// On success, returns [`SupplyChainEvent::ApprovedByProducer`].
    ApproveByProducer {
        item_id: ItemId,
        /// Yes ([`true`]) or no ([`false`]).
        approve: bool,
    },

    /// Starts shipping a purchased item to a distributor on behalf of a
    /// producer.
    ///
    /// Starts a countdown for a delivery time specified for an item in
    /// [`SupplyChainAction::PurchaseByDistributor`].
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`](gstd::msg::source) must be a producer of an item in
    /// a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`ApprovedByProducer`](ItemState::ApprovedByProducer).
    ///
    /// On success, returns [`SupplyChainEvent::ShippedByProducer`].
    ShipByProducer(ItemId),

    /// Receives a shipped item from a producer on behalf of a distributor.
    ///
    /// Depending on a time spent on a delivery, transfers fungible tokens for
    /// purchasing an item from a supply chain program to a producer or, as a
    /// penalty for being late, refunds some or all of them to a distributor.
    ///
    /// Transfers an item's NFT to a distributor ([`msg::source()`]).
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`] must be a distributor of an item in a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`ShippedByProducer`](ItemState::ShippedByProducer).
    ///
    /// On success, returns [`SupplyChainEvent::ReceivedByDistributor`].
    ///
    /// [`msg::source()`]: gstd::msg::source
    ReceiveByDistributor(ItemId),

    /// Processes a received item on behalf of a distributor.
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`](gstd::msg::source) must be a distributor of an item
    /// in a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`ReceivedByDistributor`](ItemState::ReceivedByDistributor).
    ///
    /// On success, returns [`SupplyChainEvent::ProcessedByDistributor`].
    ProcessByDistributor(ItemId),

    /// Packages a processed item on behalf of a distributor.
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`](gstd::msg::source) must be a distributor of an item
    /// in a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`ProcessedByDistributor`](ItemState::ProcessedByDistributor).
    ///
    /// On success, returns [`SupplyChainEvent::PackagedByDistributor`].
    PackageByDistributor(ItemId),

    /// Puts a packaged item up for sale to a retailer for given `price` on
    /// behalf of a distributor.
    ///
    /// Transfers an item's NFT to a supply chain program.
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`](gstd::msg::source) must be a distributor of an item
    /// in a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`PackagedByDistributor`](ItemState::PackagedByDistributor).
    ///
    /// On success, returns [`SupplyChainEvent::ForSaleByDistributor`].
    PutUpForSaleByDistributor {
        item_id: ItemId,
        /// An item's price.
        price: u128,
    },

    /// Purchases an item from a distributor on behalf of a retailer.
    ///
    /// Transfers fungible tokens for purchasing an item to a supply chain
    /// program until an item is received (by
    /// [`SupplyChainAction::ReceiveByRetailer`]).
    ///
    /// **Note:** An item's distributor must approve or not this purchase by
    /// [`SupplyChainAction::ApproveByDistributor`].
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`] must be a retailer in a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`ForSaleByDistributor`](ItemState::ForSaleByDistributor).
    ///
    /// On success, returns [`SupplyChainEvent::PurchasedByRetailer`].
    ///
    /// [`msg::source()`]: gstd::msg::source
    PurchaseByRetailer {
        item_id: ItemId,
        /// Milliseconds during which a distributor should deliver an item. A
        /// countdown starts after [`SupplyChainAction::ShipByDistributor`] is
        /// executed.
        delivery_time: u64,
    },

    /// Approves or not a retailer's purchase on behalf of a distributor.
    ///
    /// If a purchase is approved, then item's [`ItemState`] changes to
    /// [`ApprovedByDistributor`](ItemState::ApprovedByDistributor) and an item
    /// can be shipped (by [`SupplyChainAction::ShipByDistributor`]).
    ///
    /// If a purchase is **not** approved, then fungible tokens for it are
    /// refunded from a supply chain program to a retailer.
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`](gstd::msg::source) must be a distributor of an item
    /// in a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`PurchasedByRetailer`](ItemState::PurchasedByRetailer).
    ///
    /// On success, returns [`SupplyChainEvent::ApprovedByDistributor`].
    ApproveByDistributor {
        item_id: ItemId,
        /// Yes ([`true`]) or no ([`false`]).
        approve: bool,
    },

    /// Starts shipping a purchased item to a retailer on behalf of a
    /// distributor.
    ///
    /// Starts a countdown for a delivery time specified for this item in
    /// [`SupplyChainAction::PurchaseByRetailer`].
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`](gstd::msg::source) must be a distributor of an item
    /// in a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`ApprovedByDistributor`](ItemState::ApprovedByDistributor).
    ///
    /// On success, returns [`SupplyChainEvent::ShippedByDistributor`].
    ShipByDistributor(ItemId),

    /// Receives a shipped item from a distributor on behalf of a retailer.
    ///
    /// Depending on a time spent on a delivery, transfers fungible tokens for
    /// purchasing an item from a supply chain program to a distributor or, as a
    /// penalty for being late, refunds some or all of them to a retailer.
    ///
    /// Transfers an item's NFT to a retailer ([`msg::source()`]).
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`] must be a retailer of an item in
    /// a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`ShippedByDistributor`](ItemState::ShippedByDistributor).
    ///
    /// On success, returns [`SupplyChainEvent::ReceivedByRetailer`].
    ///
    /// [`msg::source()`]: gstd::msg::source
    ReceiveByRetailer(ItemId),

    /// Puts a received item up for sale to a consumer for given `price` on
    /// behalf of a retailer.
    ///
    /// Transfers an item's NFT to a supply chain program.
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * [`msg::source()`](gstd::msg::source) must be a retailer of an item in
    /// a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`ReceivedByRetailer`](ItemState::ReceivedByRetailer).
    ///
    /// On success, returns [`SupplyChainEvent::ForSaleByRetailer`].
    PutUpForSaleByRetailer {
        item_id: ItemId,
        /// An item's price.
        price: u128,
    },

    /// Purchases an item from a retailer.
    ///
    /// Transfers fungible tokens for purchasing an item to its retailer.
    ///
    /// Transfers an item's NFT to a consumer
    /// ([`msg::source()`](gstd::msg::source)).
    ///
    /// # Requirements
    /// * An item must exist in a supply chain.
    /// * Item's [`ItemState`] must be
    /// [`ForSaleByRetailer`](ItemState::ForSaleByRetailer).
    ///
    /// On success, returns [`SupplyChainEvent::PurchasedByConsumer`].
    PurchaseByConsumer(ItemId),
}
```

### Meta state queries

```rust
/// Queries a program state.
///
/// On failure, returns a [`Default`] value.
#[derive(Encode, Decode, TypeInfo)]
pub enum SupplyChainStateQuery {
    /// Gets [`ItemInfo`].
    ///
    /// Returns [`SupplyChainStateReply::ItemInfo`].
    ItemInfo(ItemId),

    /// Gets supply chain [`Participants`].
    ///
    /// Returns [`SupplyChainStateReply::Participants`].
    Participants,

    /// Gets an FT program address used by a supply chain.
    ///
    /// Returns [`SupplyChainStateReply::FTProgram`].
    FTProgram,

    /// Gets an NFT program address used by a supply chain.
    ///
    /// Returns [`SupplyChainStateReply::NFTProgram`].
    NFTProgram,
}
```

## Source code

The source code of this example of a supply chain smart contract and an implementation of its testing is available on [GitHub](https://github.com/gear-dapps/supply-chain). They can be used as is or modified to suit your own scenarios.

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
