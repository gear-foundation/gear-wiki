---
sidebar_label: NFT Marketplace
sidebar_position: 14
---

# NFT Marketplace

## 介绍

NFT Marketplace 是一个合约，你可以用同质化代币交易非同质化代币。该合约还支持 NFT 拍卖，以及提供/接受 nft 的购买提议。

任何人都可以轻松创建自己的 NFT Marketplace 应用程序，并在 Gear 网络上运行它：
- [Gear NFT](https://github.com/gear-foundation/dapps-non-fungible-token/tree/master/nft).
- [NFT marketplace](https://github.com/gear-foundation/dapps-non-fungible-token/tree/master/nft-marketplace).

本文会介绍接口、数据结构、基本功能，并说明了它们的用途。它可以按原样使用，也可以根据您自己的场景进行修改。

Gear 还 [提供](https://github.com/gear-tech/gear-js/tree/master/apps/marketplace) 了一个 [NFT Marketplace](https://marketplace.gear-tech.io/) 的用户界面，以展示其与 Gear 网络中智能合约的互动。

你也可以观看视频：**https://youtu.be/RdlWUkxlmV4**，中文字幕请看 **https://www.bilibili.com/video/BV1Ya411T7Ks**。

## 逻辑

合约状态

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

- `admin_id` - 有权批准可在 Marketplace 合约中使用的不可替代代币和可替代代币合约的帐户

- `treasury_id` -  销售佣金将被记入的账户
- `treasury_fee` - 佣金百分比（从 1% 到 5%）。Marketplace 合同被初始化时有以下字段。

- `items` - NFT 列表
- `approved_nft_contracts` -  可以在 Marketplace 上上市的 NFT
- `approved_ft_contracts` - 同质化代币账户，可以购买 Marketplace 上的物品。


商品有以下结构：

```rust
pub struct Item {
    pub owner_id: ActorId,
    pub ft_contract_id: Option<ActorId>,
    pub price: Option<u128>,
    pub auction: Option<Auction>,
    pub offers: Vec<Offer>,
}
```
- `owner_id` - 商品所有者
- `ft_contract_id` - 可以购买该物品的同质化代币。如果该字段为 `None`，那么该商品将以 Gear 代币出售。
- `price` - 商品的价格。`None`意味着该商品不在销售之列
- `auction` -  一个包含当前拍卖信息的字段。`None` 意味着该商品没有当前的拍卖
- `offers` -对该商品提出的购买建议

### NFTs 列表，修改价格或停止销售

列出 NFT 或修改销售条件，会发送以下信息。

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

### 购买 NFT

要购买 NFT，请发送以下信息：

```rust
/// Sells the NFT.
///
/// # Requirements:
/// * The NFT item must exist and be on sale.
/// * If the NFT is sold for a native Gear value, then a buyer must attach a value equal to the price.
/// * If the NFT is sold for fungible tokens then a buyer must have enough tokens in the fungible token contract.
/// * There must be no open auction on the item.
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

### NFT 拍卖

合约包括*英式拍卖*。*英式拍卖*是一种价格递增的公开拍卖，参与者公开相互出价，每一次后续出价都大于前一次。

拍卖有以下结构：

```rust
pub struct Auction {
    pub bid_period: u64,
    pub started_at: u64,
    pub ended_at: u64,
    pub current_price: u128,
    pub current_winner: ActorId,
}
```

- `bid_period` - 时间间隔。如果拍卖在`exec::blocktimestamp() + bid_period`之前结束，那么拍卖结束时间将推迟到`bid_period`。

- `started_at` - 拍卖开始时间

- `ended_at` - 拍卖结束时间

- `current_price` - 目前对 NFT 的报价

- `current_winner` - 当前拍卖的赢家

拍卖开始时有以下信息：

```rust
/// Creates an auction for selected item.
/// If the NFT item doesn't exist on the marketplace then it will be listed
///
/// Requirements:
/// * Only the item owner can start the auction.
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

要在当前的拍卖中增加竞标，请发送以下信息：

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

如果拍卖期结束，任何人都可以发送消息`SettleAuction`，该消息将向获胜者发送 NFT，并向所有者付款。

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

### 报价

对项目进行报价，请发送以下信息：

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

物品所有者可以接受该报价：

```rust
/// Accepts an offer.
///
/// Requirements:
/// * NFT item must exist and be listed on the marketplace.
/// * Only the owner can accept the offer.
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

提出报价的用户也可以撤回他的代币：

```rust
/// Withdraws tokens.
///
/// Requirements:
/// * NFT item must exist and be listed on the marketplace.
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

## 用户界面

一个[即用型应用](https://marketplace.gear-tech.io/)的例子提供了一个用户界面，与在 Gear Network 中运行的[gNFT](ttps://github.com/gear-foundation/dapps-non-fungible-token/tree/master/nft)和[Marketplace](https://github.com/gear-foundation/dapps-non-fungible-token/tree/master/nft-marketplace)智能合约互动。

- Gear Non-Fundible Token 合约可以创建 NFT 代币，证明数字资产的所有权，详情请查看[本文](/examples/Standards/gnft-721)。
- NFT Marketplace 是一个合约，你可以用同质化代币交易非同质化代币。该合约还支持 NFT 拍卖，以及提供/接受 nft 的购买提议。

你也可以观看视频：**https://youtu.be/RdlWUkxlmV4**，中文字幕请看 **https://www.bilibili.com/video/BV1Ya411T7Ks**。

![img alt](./img/nft-marketplace.png)

NFT Marketplace 合约在 [GitHub](https://github.com/gear-tech/gear-js/tree/master/apps/marketplace)上。

### 修改 .env 配置

 为了使程序正常运行，需要调整一下环境变量参数。有一个例子在[这](https://github.com/gear-tech/gear-js/blob/master/apps/marketplace/.env.example).

```sh
REACT_APP_NODE_ADDRESS
REACT_APP_IPFS_ADDRESS
REACT_APP_IPFS_GATEWAY_ADDRESS
REACT_APP_NFT_CONTRACT_ADDRESS
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS
```

- `REACT_APP_NETWORK` Gear 网络地址  (通常为 wss://rpc-node.gear-tech.io:443)
- `REACT_APP_IPFS_ADDRESS` 是用于存储 NFT 资产的 IPFS 地址 (Gear 为 https://ipfs.gear-tech.io/api/v0)
- `REACT_APP_IPFS_GATEWAY_ADDRESS` IPFS 网关地址 (https://ipfs-gw.gear-tech.io/ipfs)
- `REACT_APP_NFT_CONTRACT_ADDRESS` Gear NFT 合约地址
- `REACT_APP_MARKETPLACE_CONTRACT_ADDRESS` NFT Marketplace 合约地址

### Simple NFT

另一个演示如何使用智能合约的例子在：https://nft.gear-tech.io 。

它实现了铸造 NFT 的能力，查看合同中任何账户铸造的所有 NFT，以及查看有人批准到当前账户的 NFT（`AprovedToMe`），并有可能进一步转移到另一个账户（这个选项在[NFT Marketplace](https://marketplace.gear-tech.io/)中不可用）。

Simple NFT 合约例子在 [GitHub](https://github.com/gear-tech/gear-js/tree/master/apps/nft)上。

### 如何运行

安装以依赖：

```sh
npm install
```

运行程序：
```sh
npm start
```
在浏览器打开 http://localhost:3000

## 源码

合约源码在 [Gear-dapps](https://github.com/gear-foundation/dapps-non-fungible-token/tree/master/nft-marketplace)。

前端代码在 [Gear-tech/gear-js](https://github.com/gear-tech/gear-js/tree/master/apps/marketplace).

更多关于在 Gear 上测试智能合约的细节，请参考这篇文章：[应用测试](https://wiki.gear-tech.io/zh-cn/developing-contracts/testing/)。
