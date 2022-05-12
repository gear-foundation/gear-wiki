---
sidebar_label: 'GNFT (ERC-721)'
sidebar_position: 4
---

# Gear Non-Fungible Token

## Introduction

At Gear, we want to provide an ecosystem for developers coming from various backgrounds. We have to note that Gear offers far more advanced features and technological developments compared to platforms that popular standards like ERC-20 or ERC-721 were designed for. However, it would be inefficient to ignore such widely used interfaces in favor of arbitrary, but modern implementations. Therefore, Gear provides support for Non-Fungible Tokens (GNFT) based on Gear's vision.

In this article, we will cover usage of Gear's GNFT interface in composition with an example NFT implementation.

## What is ERC-721? 

[ERC-721](https://eips.ethereum.org/EIPS/eip-721) is a community-accepted standard for Non-Fungible Tokens (NFTs) smart contract implementation. ERC-721 describes the interface that has to be implemented by a smart contract in order to be compliant. The following functions are expected to be present in the NFT contract:

```rust
/// This emits when ownership of any NFT changes by any mechanism.
Transfer(from, to, tokenId);

/// This emits when the approved address for an NFT is changed or reaffirmed.
ApprovalForAll(_owner, operator, approved);

/// Count all NFTs assigned to an owner
balanceOf(owner): integer;

/// Find the owner of an NFT
ownerOf(tokenId): address;

/// Transfers the ownership of an NFT from one address to another address
safeTransferFrom(from, to, tokenId, data: optional);

/// Transfer ownership of an NFT
transferFrom(from, to, tokenId);

/// Change or reaffirm the approved address for an NFT
approve(approved, tokenId);

/// Enable or disable approval for a third party ("operator") to manage
setApprovalForAll(operator, approved);

/// Get the approved address for a single NFT
getApproved(tokenId): address;

/// @notice Query if an address is an authorized operator for another address
isApprovedForAll(owner, operator): bool;
```

However, implicitly, some functions - like `mint` and `burn` - are expected to be implemented in the contract as well. Implementation for those functions may vary, therefore leading to existence various NFT collections.

## Gear Non-Fungible Token

Gear provides a [GNFT interface library](https://github.com/gear-tech/apps/tree/master/non-fungible-token) with shared functionality described in the protocol.

:::note

Please note that the interface does **not** yet support features like `ERC721TokenReceiver` and `SafeTransferFrom`. However, those will be added as soon as possible.

:::

The NonFungibleToken interface introduces the `NonFungibleTokenBase` trait that contains the following function signatures:

```rust
/// called during the NFT contract deployment
fn init(&mut self, name: String, symbol: String, base_uri: String);

/// Transfer an NFT item from current owner to the new one
fn transfer(&mut self, rom: &ActorId, to: &ActorId, token_id: U256);

/// Gives a right to the actor to manage the specific token
fn approve(&mut self, owner: &ActorId, spender: &ActorId, token_id: U256);

/// Enables or disables the actor to manage all the tokens the owner has
fn approve_for_all(&mut self, owner: &ActorId, operator: &ActorId, approved: bool);
```

Functions above are essential for an NFT implementation and are implemented in the interface provided by Gear.

The core component of the GNFT interface library is the `NonFungibleToken` struct. It contains implementations for the functions defined in the `NonFungibleTokenBase` trait and some useful helper functions such as `authorized_actor`, `is_token_owner`, etc.

Gear's GNFT interface is a library that can be used as a core block in writing a smart contract for an NFT implementation. Let's take a look at how this interface can be composed into a complete contract.

## NFT example

In this section, we will be referring to [this](https://github.com/gear-tech/apps/tree/master/nft-example) implementation example of an NFT smart contract provided by Gear.

First of all, the actions accepted by the contract in accordance with ERC-721:

```rust
pub enum Action {
    Mint,
    Burn(U256),
    Transfer(TransferInput),
    Approve(ApproveInput),
    ApproveForAll(ApproveForAllInput),
    OwnerOf(U256),
    BalanceOf(H256),
}
```

The state querying methods complete the interface compliance:

```rust
pub enum State {
    BalanceOfUser(H256),
    TokenOwner(U256),
    IsTokenOwner(TokenAndUser),
    GetApproved(U256),
}
```

Gear's ERC-721 library contains full implementations for `transfer`, `approve` and `approve_for_all` actions. Let's take advantage of those by importing the library and storing it in the state of the contract.

Keep in mind, that the library also contains multiple useful structs such as `Approve`, `ApproveForAll` and `Transfer` that can be reused for a custom implementation.

```rust
pub struct NFT {
    pub tokens: NonFungibleToken,
    pub token_id: U256,
    pub owner: ActorId,
}
```

Note how `NonFungibleToken` struct from the GNFT library is composed inside the state; that allows to reuse the functionality it provides within the implementation of the contract's methods.


We will also need custom implementation for the `mint` and `burn` methods as mentioned above.

```rust
impl NFT {
    fn mint(&mut self) {
      // custom mint implementation
      ...
    }

    fn burn(&mut self, token_id: U256) {
      // custom burn implementation
      ...
    }
}
```

Now, inside the `handle` method, we can use `mint` and `burn` described above for `Mint` and `Burn` actions. For the rest of the actions (i.e. `Approve`, `ApproveForAll`, `Transfer`, `OwnerOf` and `BalanceOf`), we can reuse Gear's GNFT library implementations.

Same goes for state querying, i.e. the `metastate` method: library functions can be reused for query implementations.

For example, the `Mint` action can be implemented simply as:

```rust
Action::Mint => {
    CONTRACT.mint();
}
```

Similarly, take a look at `Approve` that takes advantage of the provided interface:

```rust
Action::Approve(input) => {
    CONTRACT.tokens.approve(
        &msg::source(),
        &ActorId::new(input.to.to_fixed_bytes()),
        input.token_id,
    );
}
```

## Conclusion

Gear provides a reusable [library](https://github.com/gear-tech/apps/tree/master/non-fungible-token/src) with core functionality for the GNFT protocol. By using object composition, that library can be utilized within a custom NFT contract implementation in order to minimize duplication of community available code.

A source code of the contract example provided by Gear is available on GitHub: [nft-example/src](https://github.com/gear-tech/apps/tree/master/nft-example/src).

See also an example of the smart contract testing implementation based on `gtest`: [nft-example/tests](https://github.com/gear-tech/apps/tree/master/nft-example/tests).

For more details about testing smart contracts written on Gear, refer to this article: [Program testing](/developing-contracts/testing.md).
