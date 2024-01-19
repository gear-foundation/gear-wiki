---
sidebar_position: 4
---

# NFT pixelboard

## Introduction

:::note
This article explains at a superficial level the purpose and logic of this smart contract. For a more detailed technical description, see its [documentation on the dapps documentation portal](https://dapps.gear.rs/nft_pixelboard_io) and [source code](#source-code).
:::

The inspiration for this smart contract comes from **The Million Dollar Homepage** ([referencing its Wikipedia article](https://en.wikipedia.org/wiki/The_Million_Dollar_Homepage)). In brief, it's a website featuring a canvas of 1000 by 1000 pixels, where each pixel costs $1. Anyone can purchase a block of pixels, like 10 by 10, or multiple blocks, paint the acquired pixels, and associate them with a web link. NFT Pixelboard follows the same idea, but with a twist: the bought pixel blocks are NFTs. They can be colored anytime, not just at the purchase and are resellable.

## Logic

`NFTPixelboardAction::Mint` is utilized for minting NFTs on a pixelboard. Users can sell their NFTs or paint them using `NFTPixelboardAction::ChangeSaleState` and `NFTPixelboardAction::Paint`, respectively.

The `painting()` metafunction is used to get the entire painting of a pixelboard. Users can retrieve details about NFTs and pixels on a pixelboard through the `token_info()` and `pixel_info()` metafunctions, respectively.

## Interface

### Initialization

```rust title="nft-pixelboard/io/src/lib.rs"
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
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
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

```rust title="nft-pixelboard/io/src/lib.rs"
// Sends a program info about what it should do.
#[derive(Decode, Encode, TypeInfo, Clone, PartialEq, Eq)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
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
    /// [`block_side_length()`](../nft_pixelboard_state/metafns/fn.block_side_length.html).
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
    /// [`pixel_price()`](../nft_pixelboard_state/metafns/fn.pixel_price.html).
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
    /// [`token_info()`]. See also the documentation of
    /// [`TokenInfo#structfield.pixel_price`].
    /// * [`msg::source()`] must have enough fungible tokens to buy all pixels
    /// that an NFT occupies. This can be found out by
    /// [`token_info()`]. See also the documentation of
    /// [`TokenInfo#structfield.pixel_price`].
    ///
    /// On success, returns [`NFTPixelboardEvent::Bought`].
    ///
    /// [`msg::source()`]: gstd::msg::source
    /// [`token_info()`]: ../nft_pixelboard_state/metafns/fn.token_info.html
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
    /// [`commission_percentage()`](../nft_pixelboard_state/metafns/fn.commission_percentage.html).
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
    /// rectangle can be obtained by [`token_info()`](../nft_pixelboard_state/metafns/fn.token_info.html).
    ///
    /// On success, returns [`NFTPixelboardEvent::Painted`].
    Paint {
        token_id: TokenId,
        painting: Vec<Color>,
    },
}
```

## Source code

The source code of the NFT pixelboard smart contract and an implementation of its testing is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/nft-pixelboard). They can be used as is or modified to suit your own scenarios.

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
