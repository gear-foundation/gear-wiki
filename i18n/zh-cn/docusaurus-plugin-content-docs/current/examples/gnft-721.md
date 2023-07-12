---
sidebar_label: gNFT (ERC-721)
sidebar_position: 4
---

# Gear 非同质化代币

### 介绍

非同质化代币（NFT）是区块链上唯一的加密代币，用于证明数字资产的所有权，如数字艺术或游戏资产。与同质化代币的区别在于，同质化代币存储的是一个值，而非同质化代币存储的是一个加密证书。在底层，一个非同质化代币由一个唯一的代币标识符或代币 ID 组成，它被映射到一个所有者标识符，并存储在一个 NFT 智能合约中。<center> <em><strong>token_id</strong></em> → <em><strong>address</strong></em> </center>

当一个给定代币 ID 的所有者希望将其转让给另一个用户时，很容易验证所有权并将代币重新分配给新的所有者。

### 非同质化代币实现

每个非同质化代币合约必须支持的功能：

- *transfer(to, token_id)* 是一个函数，允许你将带有 *token_id* 的代币转移到 *to* 帐户;

- *approve(approved_account, token_id)* - 是一个函数，允许你将处置代币的权利交给指定的*approved_account*。这个功能在市场或拍卖会上很有用，因为当所有者想出售他的代币时，他们可以把它放在市场/拍卖会上，所以合约将能够在某个时候把这个代币发送给新的所有者。

- *mint(to, token_id, metadata)* - 是一个创建新代币的函数。元数据可以包括关于代币的任何信息：它可以是一个指向特定资源的链接，也可以是对代币的描述，等等。

- *burn(from, token_id)* - 是一个函数，用于从合约中删除带有 *token_id* 的代币。

NFT 合约的实现为[gear-contract-libraries/non_fungible_token](https://github.com/gear-foundation/dapps-gear-lib/tree/master/src/non_fungible_token)。

要使用默认实现需要在 *Cargo.toml* 配置：

```toml
gear-lib = { git = "https://github.com/gear-foundation/dapps-gear-lib.git" }
gear-lib-derive = { git = "https://github.com/gear-foundation/dapps-gear-lib.git" }
hashbrown = "0.13.1"
```

non-fungible 合约的存储状态在结构 `NFTState` 中定义：

```rust
use hashbrown::HashMap;

#[derive(Debug, Default)]
pub struct NFTState {
    pub name: String,
    pub symbol: String,
    pub base_uri: String,
    pub owner_by_id: HashMap<TokenId, ActorId>,
    pub token_approvals: HashMap<TokenId, Vec<ActorId>>,
    pub token_metadata_by_id: HashMap<TokenId, Option<TokenMetadata>>,
    pub tokens_for_owner: HashMap<ActorId, Vec<TokenId>>,
    pub royalties: Option<Royalties>,
}
```

要重复使用默认结构，你需要派生出 `NFTStateKeeper`，并用 `#[NFTStateField]` 属性标记相应的字段。你也可以在 NF 合约中添加字段。例如，在合约中添加所有者的地址和`token_id`，它将跟踪当前的代币数量。

```rust
use derive_traits::{NFTStateKeeper, NFTCore, NFTMetaState};
use gear_contract_libraries::non_fungible_token::{nft_core::*, state::*, token::*};

#[derive(Debug, Default, NFTStateKeeper, NFTCore, NFTMetaState)]
pub struct NFT {
    #[NFTStateField]
    pub token: NFTState,
    pub token_id: TokenId,
    pub owner: ActorId,
    pub transactions: HashMap<H256, NFTEvent>,
}
```

为了继承默认的逻辑功能，你需要派生出 `NFTCore` 。相应地，为了读取合约状态，你需要 `NFTMetaState`

让我们来写一下 NFT 合约的整体实现。首先，我们定义消息，它将初始化合约和合约要处理的消息。

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct InitNFT {
    pub name: String,
    pub symbol: String,
    pub base_uri: String,
}

pub enum NFTAction {
    Mint {
        to: ActorId,
        token_id: TokenId,
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
}
```

NFT 合约实现：

```rust
#[derive(Debug, Default, NFTStateKeeper, NFTCore, NFTMetaState)]
pub struct NFT {
    #[NFTStateField]
    pub token: NFTState,
    pub token_id: TokenId,
    pub owner: ActorId,
    pub transactions: HashMap<H256, NFTEvent>,
}

static mut CONTRACT: Option<NFT> = None;

#[no_mangle]
extern "C" fn init() {
    let config: InitNFT = msg::load().expect("Unable to decode InitNFT");
    let mut nft = NFT::default();
    nft.token.name = config.name;
    nft.token.symbol = config.symbol;
    nft.token.base_uri = config.base_uri;
    nft.owner = msg::source();
    unsafe { CONTRACT = Some(nft) };
}

#[no_mangle]
extern "C" fn handle() {
    let action: NFTAction = msg::load().expect("Could not load msg");
    let nft = unsafe { CONTRACT.get_or_insert(NFT::default()) };
    match action {
        NFTAction::Mint { to, token_id } => NFTCore::mint(&to, token_id, None),
        NFTAction::Burn { token_id } => NFTCore::burn(nft, token_id),
        NFTAction::Transfer { to, token_id } => NFTCore::transfer(nft, &to, token_id),
        NFTAction::Approve { to, token_id } => NFTCore::approve(nft, &to, token_id),
    }
}
```

### 制定你的非同质化代币合约

接下来，让我们重写一下 `mint`函数的实现。`mint` 函数会为发送 `Mint` 消息的账户创建代币，并将元数据作为输入参数。

```rust
pub enum NFTAction {
    Mint {
        token_metadata: TokenMetadata,
        token_id: TokenId,
    },
```

`TokenMetadata` 同样定义在 gear NFT library：

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

为我们的新函数定义一个 trait，它将扩展默认的`NFTCore` 。

```rust
pub trait MyNFTCore: NFTCore {
    fn mint(&mut self, token_metadata: TokenMetadata);
}
```

并编写该 trait 的实现：

```rust
impl MyNFTCore for NFT {
    fn mint(&mut self, token_metadata: TokenMetadata) {
        NFTCore::mint(self, &msg::source(), self.token_id, Some(token_metadata));
        self.token_id = self.token_id.saturating_add(U256::one());
    }
}
```

因此，有必要对 `handle` 函数进行修改。

```rust
#[no_mangle]
extern "C" fn handle() {
    let action: NFTAction = msg::load().expect("Could not load msg");
    let nft = unsafe { CONTRACT.get_or_insert(Default::default()) };
    match action {
        NFTAction::Mint { token_metadata } => MyNFTCore::mint(token_metadata),
        NFTAction::Burn { token_id } => NFTCore::burn(nft, token_id),
        NFTAction::Transfer { to, token_id } => NFTCore::transfer(nft, &to, token_id),
        NFTAction::Approve { to, token_id } => NFTCore::approve(nft, &to, token_id),
    }
}
```

## 总结

Gear 提供了一个可重复使用的[库](https://github.com/gear-foundation/dapps-non-fungible-token/tree/master/non-fungible-token/src)，具有 gNFT 协议的核心功能。通过使用对象组合，该库可以在自定义的 NFT 合约实现中使用，以减少重复代码。

Gear 提供的合约实例的源代码可在 GitHub 上找到 [nft-example/src](https://github.com/gear-foundation/dapps-non-fungible-token/tree/master/nft-example/src)。

也请看基于 `gtest` 的智能合约测试实现的例子：[nft-example/tests](https://github.com/gear-foundation/dapps-non-fungible-token/tree/master/nft-example/tests)。

关于测试在 Gear 上编写的智能合约的更多细节，请参考这篇文章 [程序测试](/developing-contracts/testing.md)。
