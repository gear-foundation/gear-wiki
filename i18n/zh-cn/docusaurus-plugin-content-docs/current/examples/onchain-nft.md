---
sidebar_label: 链上 NFT
sidebar_position: 17
---

# 链上 gNFT 资产

## 介绍

NFT 智能合约的例子展示了当代币资产直接存储在链上的方法。有关 gNFT 智能合约植入的细节，请阅读：[gNFT-721]（/examples/gnft-721）。

当一个给定的代币 ID 的所有者希望将其转让给另一个用户时，很容易验证所有权并将代币重新分配给新的所有者。大多数 NFT 图像（或其他基础资源）被存储在其他地方（如 IPFS），只有元数据被存储在合同中。元数据包括一个名称、一个 ID 和指向外部资源的链接，图像实际存储在那里。

但这里还介绍了另一种方法。你可以直接将 NFT 存储在链上，而不需要任何外部存储。这种方法可以帮助你在外部存储出现问题时不会丢失 NFT。

本文介绍了合约接口、数据结构、基本功能并解释了它们的用途。它可以直接使用，也可以根据自己的情况进行修改。源代码可在[GitHub](https://github.com/gear-dapps/non-fungible-token/tree/master/on-chain-nft) 查看。

## 方法

为了成功实现这种方法，需要做几件事。首先，当初始化一个集合时，人们应该为一个集合提供所有可能的图层的图像。其次，在用一个小的元数据进行铸币时，应该提供一个用于特定 NFT 的图层组合。这种方法在初始化时似乎相当昂贵，但在铸币时却相对便宜。

## 开发链上 NFT 合约

每个不可伪造的代币合约必须支持的功能：
- *transfer(to, token_id)* - 允许你将带有*token_id*号码的令牌转移到*to*账户

- *approve(approved_account, token_id)* - 允许你将处置代币的权利交给指定的*approved_account*。这个功能在市场或拍卖会上很有用，因为当所有者想出售他的代币时，他们可以把它放在市场/拍卖会上，所以合同将能够在某个时候把这个代币发送给新的所有者

- *mint(to, token_id, metadata)* - 是一个创建新令牌的函数。元数据可以包括关于令牌的任何信息：它可以是一个指向特定资源的链接，也可以是对令牌的描述，等等。

- *burn(from, token_id)* 用于从合同中移除带有所述*token_id*的令牌。

NFT 合约的默认实现是在 Gear 库中提供的：[gear-lib/non_fungible_token](https://github.com/gear-dapps/gear-lib/tree/master/src/non_fungible_token)。

要使用默认的实现，请在 *Cargo.toml* 配置：

```toml
gear-lib = { git = "https://github.com/gear-dapps/gear-lib.git" }
gear-lib-derive = { git = "https://github.com/gear-dapps/gear-lib.git" }
hashbrown = "0.13.1"
```

首先，我们从修改状态和 init 信息开始：

```rust
use hashbrown::{HashMap, HashSet};

#[derive(Debug, Default, NFTStateKeeper, NFTCore, NFTMetaState)]
pub struct OnChainNFT {
    #[NFTStateField]
    pub token: NFTState,
    pub token_id: TokenId,
    pub owner: ActorId,
    pub base_image: String,
    pub layers: HashMap<LayerId, Vec<String>>,
    pub nfts: HashMap<TokenId, Vec<ItemId>>,
    pub nfts_existence: HashSet<String>,
}
```

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct InitOnChainNFT {
    pub name: String,
    pub symbol: String,
    pub base_uri: String,
    pub base_image: String,
    pub layers: Vec<(LayerId, Vec<String>)>,
    pub royalties: Option<Royalties>,
}
```

接下来让我们重写几个函数：`mint`，`burn` 和 `token_uri`。`mint` and `burn` 与人们所期望的一样，再加上状态修改。(例如，对照状态检查，添加/删除)。`token_uri` 将返回一个 NFT 的元数据，以及为指定的 NFT 提供的所有层内容。

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum OnChainNFTQuery {
    TokenURI { token_id: TokenId },
    Base(NFTQuery),
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum OnChainNFTAction {
    Mint {
        token_metadata: TokenMetadata,
        description: Vec<ItemId>,
    },
    Burn {
        token_id: TokenId,
    },
    Transfer {
        to: ActorId,
        token_id: TokenId,
    },
    Approve {
        to: ActorId,
        token_id: TokenId,
    },
    TransferPayout {
        to: ActorId,
        token_id: TokenId,
        amount: u128,
    },
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct TokenURI {
    pub metadata: TokenMetadata,
    pub content: Vec<String>,
}
```

在 Gear NFT 库中也定义了 `TokenMetadata` ：

```rust
#[derive(Debug, Default, Encode, Decode, Clone, TypeInfo)]
pub struct TokenMetadata {
    // ex. "CryptoKitty #100"
    pub name: String,
    // free-form description
    pub description: String,
    // URL to associated media, preferably to decentralized, content-addressed storage
    pub media: String,
    // URL to an off-chain JSON file with more info.
    pub reference: String,
}
```

为我们的新函数定义一个 trait，它将扩展默认的 `NFTCore`特质：

```rust
pub trait OnChainNFTCore: NFTCore {
    fn mint(&mut self, description: Vec<ItemId>, metadata: TokenMetadata);
    fn burn(&mut self, token_id: TokenId);
    fn token_uri(&mut self, token_id: TokenId) -> Option<Vec<u8>>;
}
```

并编写该 trait 的实现：

```rust
impl OnChainNFTCore for OnChainNFT {

    /// Mint an NFT on chain.
    /// `description` - is the vector of ids ,
    ///  where each index represents a layer id, and element represents a layer item id.
    /// `metadata` - is the default metadata provided by gear-lib.
    fn mint(&mut self, description: Vec<ItemId>, metadata: TokenMetadata) {
        // precheck if the layers actually exist
        for (layer_id, layer_item_id) in description.iter().enumerate() {
            if layer_id > self.layers.len() {
                panic!("No such layer");
            }
            if *layer_item_id > self.layers.get(&(layer_id as u128)).expect("No such layer").len() as u128 {
                panic!("No such item");
            }
        }

        // also check if description has all layers provided
        if description.len() != self.layers.len() {
            panic!("The number of layers must be equal to the number of layers in the contract");
        }

        // precheck if there is already an nft with such description
        let key = description
            .clone()
            .into_iter()
            .map(|i| i.to_string())
            .collect::<String>();
        if self.nfts_existence.contains(&key) {
            panic!("Such nft already exists");
        }
        self.nfts_existence.insert(key);
        NFTCore::mint(self, &msg::source(), self.token_id, Some(metadata));
        self.nfts.insert(self.token_id, description);
        self.token_id = self.token_id.saturating_add(U256::one());
    }

    /// Burns an NFT.
    /// `token_id` - is the id of a token. MUST exist.
    fn burn(&mut self, token_id: TokenId) {
        NFTCore::burn(self, token_id);
        let key = self
            .nfts
            .get(&token_id)
            .expect("No such token")
            .iter()
            .map(|i| i.to_string())
            .collect::<String>();
        self.nfts.remove(&token_id);
        self.nfts_existence.remove(&key);
    }

    /// Returns token information - metadata and all the content of all the layers for the NFT.
    /// `token_id` - is the id of a token. MUST exist.
    fn token_uri(&mut self, token_id: TokenId) -> Option<Vec<u8>> {
        let mut metadata = TokenMetadata::default();
        if let Some(Some(mtd)) = self.token.token_metadata_by_id.get(&token_id) {
            metadata = mtd.clone();
        }
        // construct media
        let mut content: Vec<String> = Vec::new();
        // check if exists
        let nft = self.nfts.get(&token_id).expect("No such nft");
        for (layer_id, layer_item_id) in nft.iter().enumerate() {
            let layer_content = self
                .layers
                .get(&(layer_id as u128))
                .expect("No such layer")
                .iter()
                .nth(*layer_item_id as usize)
                .expect("No such layer item");
            content.push(layer_content.clone());
        }
        Some(TokenURI { metadata, content }.encode())
    }
}
```

因此，有必要对`handle`和`meta_state`函数进行修改：

```rust
#[no_mangle]
extern "C" fn handle() {
    let action: OnChainNFTAction = msg::load().expect("Could not load OnChainNFTAction");
    let nft = unsafe { CONTRACT.get_or_insert(Default::default()) };
    match action {
        OnChainNFTAction::Mint {
            description,
            token_metadata,
        } => OnChainNFTCore::mint(nft, description, token_metadata),
        OnChainNFTAction::Burn { token_id } => OnChainNFTCore::burn(nft, token_id),
        OnChainNFTAction::Transfer { to, token_id } => NFTCore::transfer(nft, &to, token_id),
        OnChainNFTAction::TransferPayout {
            to,
            token_id,
            amount,
        } => NFTCore::transfer_payout(nft, &to, token_id, amount),
        OnChainNFTAction::Approve { to, token_id } => NFTCore::approve(nft, &to, token_id),
    }
}

#[no_mangle]
extern "C" fn meta_state() -> *mut [i32; 2] {
    let query: OnChainNFTQuery = msg::load().expect("failed to decode input argument");
    let nft = unsafe { CONTRACT.get_or_insert(Default::default()) };
    match query {
        OnChainNFTQuery::TokenURI { token_id } => {
            let encoded = OnChainNFTCore::token_uri(nft, token_id)
                .expect("Error in reading OnChainNFT contract state");
            gstd::util::to_leak_ptr(encoded)
        }
        OnChainNFTQuery::Base(query) => {
            let encoded =
                NFTMetaState::proc_state(nft, query).expect("Error in reading NFT contract state");
            gstd::util::to_leak_ptr(encoded)
        }
    }
}
```

## 总结

Gear 为 gNFT 协议的核心功能提供了一个可重复使用的[库](https://github.com/gear-dapps/non-fungible-token/tree/master/nft/src)。通过使用对象组合，该库可以在自定义的 NFT 合约实现中使用，减少可重复代码。

本合约实现在 GitHub [on-chain-nft/src](https://github.com/gear-dapps/non-fungible-token/tree/master/on-chain-nft/src)上。

同样可以找到基于 `gtest` 实现的智能合约测试范例：`gtest`: [on-chain-nft/tests](https://github.com/gear-dapps/non-fungible-token/tree/master/on-chain-nft/tests)。

更多关于在 Gear 上测试智能合约的细节，请参考这篇文章：[应用测试](https://wiki.gear-tech.io/zh-cn/developing-contracts/testing/)。
