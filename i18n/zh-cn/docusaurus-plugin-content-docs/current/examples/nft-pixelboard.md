---
sidebar_position: 20
---

# NFT 像素画布

## 介绍

:::note

这篇文章直观介绍了智能合约的目的和逻辑。关于更详细的技术描述，请看[文档](https://dapps.gear.rs/nft_pixelboard_io) 和 [源码](#源码)。
:::

这个智能合约的想法来自 [**百万美元主页**](https://en.wikipedia.org/wiki/The_Million_Dollar_Homepage)。简单来说，这是一个有 1000 x 1000 像素画布的网站，上面的 1 个像素售价是 1 美元。每个人都可以在那里买一个 10 x 10 的像素块或几个这样的块，绘制购买的像素块，并在上面附上一些网络链接。NFT 像素画布使用同样的逻辑，但此外，购买的像素块是 NFT，它们可以在任何时候着色，而不仅仅是在购买的时候，并且可以转售。

## 业务逻辑

`NFTPixelboardAction::Mint` 方法用来 mint nft。`NFTPixelboardAction::ChangeSaleState` 方法用来售卖像素块，`NFTPixelboardAction::Paint` 方法用来绘制像素块。

`NFTPixelboardStateQuery::Painting` 用于获取像素板的整个绘画。用户通过 `NFTPixelboardStateQuery::TokenInfo` 和 `NFTPixelboardStateQuery::PixelInfo` 可以获取 nft 和像素相关的信息。

## 接口

### 初始化

```rust
/// Initializes the NFT pixelboard program.
///
/// # Requirements
/// * `owner` address mustn't be [`ActorId::zero()`].
/// * `block_side_length` must be more than 0.
/// * `pixel_price` mustn't be more than [`MAX_PIXEL_PRICE`].
/// * A [width](`Resolution#structfield.width`) &
/// [height](`Resolution#structfield.height`) (`resolution`) of a canvas must be
/// more than 0.
/// * Each side of `resolution` must be a multiple of `block_side_length`.
/// * `painting` length must equal a pixel count in a canvas (which can be
/// calculated by multiplying a [width](`Resolution#structfield.width`) &
/// [height](`Resolution#structfield.height`) from `resolution`).
/// * `commission_percentage` mustn't be more than 100.
/// * `ft_program` address mustn't be [`ActorId::zero()`].
/// * `nft_program` address mustn't be [`ActorId::zero()`].
#[derive(Decode, Encode, TypeInfo, Clone)]
pub struct InitNFTPixelboard {
    /// An address of a pixelboard owner to which minting fees and commissions
    /// on resales will be transferred.
    pub owner: ActorId,
    /// A block side length.
    ///
    /// To avoid a canvas clogging with one pixel NFTs, blocks are used instead
    /// of pixels to set NFT [`Rectangle`]s. This parameter is used to set a
    /// side length of these pixel blocks. If blocks aren't needed, then this
    /// parameter can be set to 1, so the block side length will equal a pixel.
    pub block_side_length: BlockSideLength,
    /// The price of a free pixel. It'll be used to calculate a minting price.
    pub pixel_price: u128,
    /// A canvas (pixelboard) [width](`Resolution#structfield.width`) &
    /// [height](`Resolution#structfield.height`).
    pub resolution: Resolution,
    /// A commission percentage that'll be included in each NFT resale.
    pub commission_percentage: u8,
    /// A painting that'll be displayed on the free territory of a pixelboard.
    pub painting: Vec<Color>,

    /// A FT program address.
    pub ft_program: ActorId,
    /// An NFT program address.
    pub nft_program: ActorId,
}
```

### Actions

```rust
/// Sends a program info about what it should do.
#[derive(Decode, Encode, TypeInfo, Clone)]
pub enum NFTPixelboardAction {
    /// Mints one NFT on a pixelboard with given `token_metadata` & `painting`.
    ///
    /// Transfers a minted NFT to [`msg::source()`].
    ///
    /// # Requirements
    /// * `rectangle` coordinates mustn't be out of a canvas.
    /// * `rectangle` coordinates mustn't be mixed up or belong to wrong
    /// corners.
    /// * `rectangle` coordinates must observe a block layout. In other words,
    /// each `rectangle` coordinate must be a multiple of a block side length in
    /// the canvas. The block side length can be obtained by
    /// [`NFTPixelboardStateQuery::BlockSideLength`].
    /// * NFT `rectangle` mustn't collide with already minted one.
    /// * `painting` length must equal a pixel count in an NFT
    /// (which can be calculated by multiplying a [width](`Rectangle::width`) &
    /// [height](`Rectangle::height`) from `rectangle`).
    /// * [`msg::source()`] must have enough fungible tokens to buy all free
    /// pixels that `rectangle` will occupy. An enough number of tokens can be
    /// calculated by multiplying a `rectangle` area and the price of a free
    /// pixel. The area can be calculated by multiplying a
    /// [width](`Rectangle::width`) & [height](`Rectangle::height`) from
    /// `rectangle`. The price of a free pixel can be obtained by
    /// [`NFTPixelboardStateQuery::PixelPrice`].
    ///
    /// On success, returns [`NFTPixelboardEvent::Minted`].
    ///
    /// [`msg::source()`]: gstd::msg::source
    Mint {
        rectangle: Rectangle,
        token_metadata: TokenMetadata,
        /// A painting that'll be displayed in a place of an NFT on a pixelboard
        /// after a successful minting.
        painting: Vec<Color>,
    },

    /// Buys an NFT minted on a pixelboard.
    ///
    /// Transfers a purchased NFT from a pixelboard program to
    /// [`msg::source()`].
    ///
    /// **Note:** If [`msg::source()`] has enough fungible tokens to pay a
    /// resale commission but not the entire NFT, then the commission will still
    /// be withdrawn from its account.
    ///
    /// # Requirements
    /// * An NFT must be minted on a pixelboard.
    /// * An NFT must be for sale. This can be found out by
    /// [`NFTPixelboardStateQuery::TokenInfo`]. See also the documentation of
    /// [`TokenInfo#structfield.pixel_price`].
    /// * [`msg::source()`] must have enough fungible tokens to buy all pixels
    /// that an NFT occupies. This can be found out by
    /// [`NFTPixelboardStateQuery::TokenInfo`]. See also the documentation of
    /// [`TokenInfo#structfield.pixel_price`].
    ///
    /// On success, returns [`NFTPixelboardEvent::Bought`].
    ///
    /// [`msg::source()`]: gstd::msg::source
    Buy(TokenId),

    /// Changes a sale state of an NFT minted on a pixelboard.
    ///
    /// There are 3 options of a sale state change:
    /// * Putting up for sale\
    /// If an NFT is **not** for sale, then assigning `pixel_price` to [`Some`]
    /// price will transfer it to a pixelboard program & put it up for sale.
    /// * Updating a pixel price\
    /// If an NFT is for sale, then assigning `pixel_price` to [`Some`] price
    /// will update its pixel price.
    /// * Removing from sale\
    /// Assigning the `pixel_price` to [`None`] will transfer an NFT back to its
    /// owner & remove an NFT from sale.
    ///
    /// **Note:** A commission is included in each NFT resale, so a seller
    /// will receive not all fungible tokens but tokens with a commission
    /// deduction. A commission percentage can be obtained by
    /// [`NFTPixelboardStateQuery::CommissionPercentage`].
    ///
    /// # Requirements
    /// * An NFT must be minted on a pixelboard.
    /// * [`msg::source()`](gstd::msg::source) must be the owner of an NFT.
    /// * `pixel_price` mustn't be more than [`MAX_PIXEL_PRICE`].
    ///
    /// On success, returns [`NFTPixelboardEvent::SaleStateChanged`].
    ChangeSaleState {
        token_id: TokenId,
        /// A price of each pixel that an NFT occupies. To calculate a price of
        /// the entire NFT, see the documentation of
        /// [`TokenInfo#structfield.pixel_price`].
        pixel_price: Option<u128>,
    },

    /// Paints with `painting` an NFT minted on a pixelboard.
    ///
    /// # Requirements
    /// * An NFT must be minted on a pixelboard.
    /// * [`msg::source()`](gstd::msg::source) must be the owner of an NFT.
    /// * `painting` length must equal a pixel count in an NFT. The count can be
    /// calculated by multiplying a [width](`Rectangle::width`) &
    /// [height](`Rectangle::height`) from a rectangle of the NFT. The NFT
    /// rectangle can be obtained by [`NFTPixelboardStateQuery::TokenInfo`].
    ///
    /// On success, returns [`NFTPixelboardEvent::Painted`].
    Paint {
        token_id: TokenId,
        painting: Vec<Color>,
    },
}
```

### Meta state 查询

```rust
/// Queries a program state.
///
/// On failure, returns a [`Default`] value.
#[derive(Decode, Encode, TypeInfo)]
pub enum NFTPixelboardStateQuery {
    /// Gets a painting from an entire canvas of a pixelboard.
    ///
    /// Returns [`NFTPixelboardStateReply::Painting`].
    Painting,

    /// Gets a pixelboard (canvas) resolution.
    ///
    /// Returns [`NFTPixelboardStateReply::Resolution`].
    Resolution,

    /// Gets the price of a free pixel.
    ///
    /// Returns [`NFTPixelboardStateReply::PixelPrice`].
    PixelPrice,

    /// Gets a block side length.
    ///
    /// For more info about this parameter, see
    /// [`InitNFTPixelboard#structfield.block_side_length`] documentation.
    ///
    /// Returns [`NFTPixelboardStateReply::BlockSideLength`].
    BlockSideLength,

    /// Gets [`Token`] info by pixel coordinates.
    ///
    /// Useful, for example, for inspecting a pixelboard by clicking on
    /// paintings.
    ///
    /// Returns [`NFTPixelboardStateReply::PixelInfo`].
    PixelInfo(Coordinates),

    /// Gets [`Token`] info by its ID.
    ///
    /// Returns [`NFTPixelboardStateReply::TokenInfo`].
    TokenInfo(TokenId),

    /// Gets a resale commission percentage.
    ///
    /// Returns [`NFTPixelboardStateReply::CommissionPercentage`].
    CommissionPercentage,

    /// Gets an FT program address used by a pixelboard.
    ///
    /// Returns [`NFTPixelboardStateReply::FTProgram`].
    FTProgram,

    /// Gets an NFT program address used by a pixelboard.
    ///
    /// Returns [`NFTPixelboardStateReply::NFTProgram`].
    NFTProgram,
}
```

## 源码

本合约代码实现已在 [GitHub](https://github.com/gear-dapps/nft-pixelboard)上开源。

更多关于在 Gear 上测试智能合约的细节，请参考这篇文章：[应用测试](https://wiki.gear-tech.io/zh-cn/developing-contracts/testing/)。
