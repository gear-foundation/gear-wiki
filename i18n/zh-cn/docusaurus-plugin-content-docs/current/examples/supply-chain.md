---
sidebar_label: '供应链'
sidebar_position: 10
---

# 供应链是什么？

在物流中，供应链是用于跟踪并向终端消费者交付各种物品的系统。通常，如果没有大量的文书工作和其他层级的官僚机构，这样的系统就无法运行。所有这些都要花费大量的时间和金钱，并增加了发生意外错误的可能性，或者最糟糕的是，发生欺诈。借助智能合约和区块链技术，可以使供应链更加高效、可靠和透明，用来消除这些问题。

这是供应链智能合约的示例。

## 业务逻辑

* 每个新产生的项目会得到 NFT（在Gear的上下文中--[GNFT token](gnft-721.md)和 NFT相关的ID。然后，随着物品在供应链上的移动，物品的NFT在供应链程序、物品的生产商和未来的分销商、零售商和最终消费者之间转移。
* 任何知道物品 ID 的人都可以获取物品信息
* 销售、购买、交付使用 [GFT 代币](gft-20.md)。

ItemInfo 结构如下：

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

`ItemState` 是一个枚举类型：
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

## 接口

### 初始化配置

```rust
struct InitSupplyChain {
    producers: BTreeSet<ActorId>,
    distributors: BTreeSet<ActorId>,
    retailers: BTreeSet<ActorId>,

    ft_program_id: ActorId,
    nft_program_id: ActorId,
}
```

### 方法

```rust
async fn produce_item(&mut self, name: String, notes: String)
```

Produces one item with a name and notes and replies with its ID.
Transfers created NFT for an item to a producer.

生产一个带有名称和备注的商品，并以其ID进行消息回复。
将为一个项目创建的NFT转移给提供商。

必要条件：
* `msg::source()` 必须是供应链提供商

参数：
* `name`：商品名称
* `notes`：商品备注

```rust
async fn put_up_for_sale_by_producer(&mut self, item_id: U256, price: u128)
```

代表生产商将商品以给定的价格卖给分销商。
将商品的NFT转移到供应链。

必要条件：
* `msg::source()`必须是供应链中的生产者也是这个产品的生产者
* 商品的 `ItemState` 必须是 `Produced`

参数：
* `item_id`：商品 ID
* `price`: an item's price.

```rust
async fn purchase_by_distributor(&mut self, item_id: U256, delivery_time: u64)
```

代表经销商从生产商处购买商品。
将用于购买项目的代币转移到供应链直到一个条目被接收(通过`receive_by_distributor`函数)。

必要条件：
* `msg::source()` 必须是供应链中的分销商
* 商品的 `ItemState` 必须是 `ForSaleByProducer`

参数：
* `item_id`：商品 ID
* 生产者的交货时间，已秒为单位。在`ship_by_producer` 函数执行后开始倒计时。

```rust
fn ship_by_producer(&mut self, item_id: U256)
```

开始代表生产商向分销商运送购买的物品。以 `purchase_by_distributor` 函数中指定的交付时间启动倒计时。

必要条件：
* `msg::source()` 必须是供应链中的生产者也是这个产品的生产者
* 商品的 `ItemState` 必须是 `PurchasedByDistributor`

参数：
* `item_id`：商品 ID

```rust
async fn receive_by_distributor(&mut self, item_id: U256)
```

代表分销商从生产商接收已发货的产品。
根据计算的交付时间，将用于购买项目的代币从供应链转移到生产商，或作为延迟的惩罚，将部分或全部退款给分销商。
将商品的NFT转移到经销商。

必要条件：
* `msg::source()`必须是供应链中的分销商也是这个项目的经销商
* 商品的 `ItemState` 必须是 `ShippedByProducer`

参数：
* `item_id`：商品 ID

```rust
fn process_by_distributor(&mut self, item_id: U256)
```

代表经销商处理从生产者收到的产品。

必要条件：
* `msg::source()` 必须是供应链中的分销商也是这个项目的经销商
* 商品的 `ItemState` 必须是 `ReceivedByDistributor`

参数：
* `item_id`：商品 ID

```rust
fn package_by_distributor(&mut self, item_id: U256)
```
代表经销商对已处理的产品进行包装。

必要条件：
* `msg::source()`必须是供应链中的分销商也是这个项目的经销商
* 商品的 `ItemState` 必须是 `ProcessedByDistributor`

参数：
* `item_id`：商品 ID

```rust
async fn put_up_for_sale_by_distributor(&mut self, item_id: U256, price: u128)
```
代表经销商将包装好的商品以给定的价格卖给零售商。
将项目的NFT转移到供应链。

必要条件：
* `msg::source()`必须是供应链中的分销商和该项目的分销商。
* 商品的 `ItemState` 必须是 `PackagedByDistributor`

参数：
* `item_id`：商品 ID
* `price`: 商品价格

```rust
async fn purchase_by_retailer(&mut self, item_id: U256, delivery_time: u64)
```
代表零售商从经销商处购买商品。
将购买商品的代币转移到供应链，直到收到商品为止(通过`receive_by_retailer`函数)。

必要条件：
* `msg::source()` 必须是供应链中的零售商。
* 商品的 `ItemState` 必须是 `ForSaleByDistributor`

参数：
* `item_id`：商品 ID
* `delivery_time`：经销商必须在此时间内交付一件商品，以秒为单位。在 `ship_by_distributor`函数执行后开始倒计时。

```rust
fn ship_by_distributor(&mut self, item_id: U256)
```
开始代表经销商将购买的物品运送给零售商。
为`purchase_by_retailer` 函数中指定的交付时间启动倒计时。

必要条件：
* `msg::source()` 必须是供应链中的分销商和该项目的分销商。
* 商品的 `ItemState` 必须是 `PurchasedByRetailer`

参数：
* `item_id`：商品 ID

```rust
async fn receive_by_retailer(&mut self, item_id: U256)
```
代表零售商从经销商处接收已发运的项目。
根据已计算的交付时间，将用于购买项目的代币从供应链转移到分销商，或作为延迟的惩罚，将部分或全部退款给零售商。
将物品的NFT转移到零售商。

必要条件：
* `msg::source()` 必须是供应链中的零售商
* 商品的 `ItemState` 必须是 `ShippedByDistributor`

参数：
* `item_id`：商品 ID

```rust
async fn put_up_for_sale_by_retailer(&mut self, item_id: U256, price: u128)
```
代表零售商将从经销商收到的商品以给定的价格出售给消费者。
将项目的NFT转移到供应链。

必要条件：
* `msg::source()` 还有这个商品的零售商
* 商品的 `ItemState` 必须是 `ReceivedByRetailer`

参数：
* `item_id`：商品 ID
* `price`: 商品价格

```rust
async fn purchase_by_consumer(&mut self, item_id: U256)
```
从零售商那里购买商品。
将购买物品的代币转让给其零售商。
将商品的NFT转移给消费者。

必要条件：
* 商品的 `ItemState` 必须是 `ForSaleByRetailer`

参数：
* `item_id`：商品 ID

```rust
fn get_item_info(&mut self, item_id: U256)
```

获取商品信息

参数：
* `item_id`：商品 ID

### Actions & events

**Action** 是一个被发送到程序的枚举类型，包含了它应该如何处理。在成功处理**Action**后，程序用**Event**枚举进行回复，其中包含已处理的**Action**及其结果的信息。

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

## 源码

供应链的合约源代码可以在 [GitHub](https://github.com/gear-tech/apps/blob/master/supply-chain) 找到。

更多关于在 Gear 的测试智能合约的细节，请参考这篇文章：[应用测试](https://wiki.gear-tech.io/zh-cn/developing-contracts/testing/)。
