---
sidebar_label: DEX
sidebar_position: 21
---

# DEX (decentralized exchange)

## Introduction
A decentralized exchange (DEX, for short), is a peer-to-peer marketplace where transactions occur directly between cryptocurrency traders. Unlike centralized exchanges like Binance, DEXs don’t allow for exchanges between fiat and cryptocurrencies; instead, they exclusively trade cryptocurrency tokens for other cryptocurrency tokens.

Decentralized exchanges, on the other hand, are essentially a set of smart contracts. They establish the prices of various cryptocurrencies algorithmically and use "liquidity pools," in which investors lock funds in exchange for interest-like rewards, to facilitate trades.

While transactions on a centralized exchange are recorded in that exchange's internal database, DEX transactions are settled directly on the blockchain.

DEXs are usually built on open-source code, meaning that anyone interested can see exactly how they work. This also means that developers can adapt existing code to create new competing projects, which is how Uniswap's code has been adapted by a whole host of DEXs with "swap" in their names, such as Sushiswap and Pancakeswap.

The exchange uses [Gear fungible tokens (GFT-20)](gft-20) underneath for the tokens and [Gear-lib FT wrapper](https://github.com/gear-foundation/dapps/tree/master/contracts/gear-lib-old/src/fungible_token) for the pair to keep track of the liquidity.

### Math
As it was said all the prices are algorithmically calculated. Investors provide funds to the liquidity pools and price is calculated according to the amount of tokens in the reserves using the following formula: <br/><br/>
$$reserve0 * reserve1 = K$$, where $$reserve0, reserve1$$ - are the reserves of token0 and token1 respectively provided by the investors, and $$K$$ - is the constant.
All the prices/amounts are calculated in the way that the $$K$$ **MUST** remain constant. This basically means that the more token0 we have in the pool, the lower price of token1 will be when performing a swap.

## Factory contract description
Taking into account that we might have a large amount of trading pairs, we should have a way to monitor them/deploy another one and etc. That's where a factory comes into play. Factory helps to create a new pair and monitor all the existing pairs.

### Actions

All of the actions are pretty straightforward. We have an action to initialize a factory, to create a pair and to modify fee related stuff.

```rust

pub type TokenId = ActorId;

/// Initializes a factory.
///
#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct InitFactory {
    /// The address that can actually set the fee.
    pub fee_to_setter: ActorId,
    /// Code hash to successfully deploy a pair with this contract.
    pub pair_code_hash: [u8; 32],
}


#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum FactoryAction {
    /// Creates an exchange pair
    ///
    /// Deploys a pair exchange contract and saves the info about it.
    /// # Requirements:
    /// * both `TokenId` MUST be non-zero addresses and represent the actual fungible-token contracts
    ///
    /// On success returns `FactoryEvery::PairCreated`
    CreatePair(TokenId, TokenId),

    /// Sets fee_to variable
    ///
    /// Sets an address where the fees will be sent.
    /// # Requirements:
    /// * `fee_to` MUST be non-zero address
    /// * action sender MUST be the same as `fee_to_setter` in this contract
    ///
    /// On success returns `FactoryEvery::FeeToSet`
    SetFeeTo(ActorId),

    /// Sets fee_to_setter variable
    ///
    /// Sets an address that will be able to change fee_to
    /// # Requirements:
    /// * `fee_to_setter` MUST be non-zero address
    /// * action sender MUST be the same as `fee_to_setter` in this contract
    ///
    /// On success returns `FactoryEvery::FeeToSetterSet`
    SetFeeToSetter(ActorId),

    /// Returns a `fee_to` variables.
    ///
    /// Just returns a variable `fee_to` from the state.
    ///
    /// On success returns `FactoryEvery::FeeTo`
    FeeTo,
}
```

### Events

All of the actions above have the exact counterparts:
```rust

#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum FactoryEvent {
    PairCreated {
        /// The first token address
        token_a: TokenId,
        /// The second token address
        token_b: TokenId,
        /// Pair address (the pair exchange contract).
        pair_address: ActorId,
        /// The amount of pairs that already were deployed through this factory.
        pairs_length: u32,
    },
    FeeToSet(ActorId),
    FeeToSetterSet(ActorId),
    FeeTo(ActorId),
}
```

### Program metadata and state
Metadata interface description:

```rust
pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = In<InitFactory>;
    type Handle = InOut<FactoryAction, FactoryEvent>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Out<State>;
}
```
To display the full contract state information, the `state()` function is used:

```rust
#[no_mangle]
extern "C" fn state() {
    reply(common_state())
        .expect("Failed to encode or reply with `<ContractMetadata as Metadata>::State` from `state()`");
}
```
To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `State` struct. For example - [gear-foundation/dapps/dex/factory/state](https://github.com/gear-foundation/dapps/tree/master/contracts/dex/factory/state):

```rust
#[metawasm]
pub trait Metawasm {
    type State = dex_factory_io::State;

    fn fee_to(state: Self::State) -> ActorId {
        state.fee_to
    }

    fn fee_to_setter(state: Self::State) -> ActorId {
        state.fee_to_setter
    }

    fn pair_address(pair: Pair, state: Self::State) -> ActorId {
        state.pair_address(pair.0, pair.1)
    }

    fn all_pairs_length(state: Self::State) -> u32 {
        state.all_pairs_length()
    }

    fn owner(state: Self::State) -> ActorId {
        state.owner_id
    }
}

type Pair = (FungibleId, FungibleId);
```

### Interfaces
According to the list of actions, we have functions to cover them all:
```rust
/// Sets a fee_to address
/// `fee_to` MUST be a non-zero address
/// Message source MUST be a fee_to_setter of the contract
/// Arguments:
/// * `fee_to` is a new fee_to address
fn set_fee_to(&mut self, fee_to: ActorId);

/// Sets a fee_to_setter address
/// `fee_to_setter` MUST be a non-zero address
/// Message source MUST be a fee_to_setter of the contract
/// Arguments:
/// * `fee_to_setter` is a new fee_to_setter address
fn set_fee_to_setter(&mut self, fee_to_setter: ActorId);

/// Creates and deploys a new pair
/// Both token address MUST be different and non-zero
/// Also the pair MUST not be created already
/// Arguments:
/// * `token_a` is the first token address
/// * `token_b` is the second token address
async fn create_pair(&mut self, mut token_a: ActorId, mut token_b: ActorId);
```

### Source code
The source code of this example of DEX factory smart contract and the example of an implementation of its testing is available on [gear-foundation/dapps/dex/factory](https://github.com/gear-foundation/dapps/tree/master/contracts/dex/factory).

See also an example of the smart contract testing implementation based on `gtest`: [tests/utils/factory.rs](https://github.com/gear-foundation/dapps/blob/master/contracts/dex/tests/utils/factory.rs).

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.

## Pair contract description
The pair contract is where all the exchange magic happens. Each pair contract handles the liquidity provided to this pair only. All swap operations are performed applying the formula in the Math section.

### Actions
```rust

pub type TokenId = ActorId;

/// Initializes a pair.
///
/// # Requirements:
/// * both `TokenId` MUST be fungible token contracts with a non-zero address.
/// * factory MUST be a non-zero address.
#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct InitPair {
    /// Factory address which deployed this pair.
    pub factory: ActorId,
    /// The first FT token address.
    pub token0: TokenId,
    /// The second FT token address.
    pub token1: TokenId,
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum PairAction {
    /// Adds liquidity to the pair.
    ///
    /// Adds a specified amount of both tokens to the pair contract.
    /// # Requirements:
    /// * all the values MUST non-zero positive numbers.
    /// * `to` MUST be a non-zero address.
    ///
    /// On success returns `PairEvent::AddedLiquidity`.
    AddLiquidity {
        /// The amount of token 0 which is desired by a user.
        amount0_desired: u128,
        /// The amount of token 1 which is desired by a user.
        amount1_desired: u128,
        /// The minimum amount of token 0 which a user is willing to add.
        amount0_min: u128,
        /// The minimum amount of token 1 which a user is willing to add.
        amount1_min: u128,
        /// Who is adding the liquidity.
        to: ActorId,
    },

    /// Removes liquidity from the pair.
    ///
    /// Removes a specified amount of liquidity from the pair contact.
    /// # Requirements:
    /// * all the values MUST non-zero positive numbers.
    /// * `to` MUST be a non-zero address.
    ///
    /// On success returns `PairEvent::RemovedLiquidity`.
    RemoveLiquidity {
        /// Liquidity amount to be removed.
        liquidity: u128,
        /// The minimal amount of token 0 a user is willing to get.
        amount0_min: u128,
        /// The minimal amount of token 1 a user is willing to get.
        amount1_min: u128,
        // Who is removing liquidity.
        to: ActorId,
    },

    /// Forces the reserves to match the balances.
    ///
    /// On success returns `PairEvent::Sync`.
    Sync,

    /// Forces the reserves to match the balances.
    ///
    /// Forces the reserves to match the balances while sending all the extra tokens to a specified user.
    /// On success returns `PairEvent::Skim`
    Skim {
        /// Who will get extra tokens.
        to: ActorId,
    },

    /// Swaps token 0 for token 1.
    ///
    /// Swaps the provided amount of token 0 for token 1.
    /// Requirements:
    /// * `to` - MUST be a non-zero address.
    /// * `amount_in` - MUST be a positive number and less than the liquidity of token 0.
    ///
    /// On success returns `PairEvent::SwapExactTokensFor`.
    SwapExactTokensFor {
        /// Who is performing a swap.
        to: ActorId,
        /// Amount of token0 you wish to trade.
        amount_in: u128,
    },

    /// Swaps token 1 for token 0.
    ///
    /// Swaps the provided amount of token 1 for token 0.
    /// Requirements:
    /// * `to` - MUST be a non-zero address.
    /// * `amount_out` - MUST be a positive number and less than the liquidity of token 1.
    ///
    /// On sucess returns `PairEvent::SwapTokensForExact`.
    SwapTokensForExact {
        /// Who is performing a swap.
        to: ActorId,
        /// Amount of token 0 the user with to trade.
        amount_out: u128,
    },
}
```

### Events
All of the actions above have the exact counterparts:
```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum PairEvent {
    AddedLiquidity {
        /// The amount of token0 added to liquidity.
        amount0: u128,
        /// The amount of token1 added to liquidity.
        amount1: u128,
        /// Overall liquidity amount that has been added.
        liquidity: u128,
        /// Liquidity provider.
        to: ActorId,
    },
    Sync {
        /// The balance of token0.
        balance0: u128,
        /// The balance of token1.
        balance1: u128,
        /// The amount of token0 stored on the contract.
        reserve0: u128,
        /// The amount of token1 stored on the contract.
        reserve1: u128,
    },
    Skim {
        /// Fee collector.
        to: ActorId,
        /// The amount of extra token0.
        amount0: u128,
        /// The amount of extra token1.
        amount1: u128,
    },
    SwapExactTokensFor {
        /// Swap performer.
        to: ActorId,
        /// The amount of token0 a user is providing.
        amount_in: u128,
        /// The amount of token1 a user is getting.
        amount_out: u128,
    },
    SwapTokensForExact {
        /// Swap performed.
        to: ActorId,
        /// The amount of token0 a user is getting.
        amount_in: u128,
        /// The amount of token1 a user is providing.
        amount_out: u128,
    },
}
```

### Program metadata and state
Metadata interface description:

```rust
pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = In<InitPair>;
    type Handle = InOut<PairAction, PairEvent>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Out<State>;
}
```
To display the full contract state information, the `state()` function is used:

```rust
#[no_mangle]
extern "C" fn state() {
    reply(common_state())
        .expect("Failed to encode or reply with `<ContractMetadata as Metadata>::State` from `state()`");
}
```
To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `State` struct. For example - [dex/state](https://github.com/gear-foundation/dapps/tree/master/contracts/dex/state):

```rust
#[metawasm]
pub trait Metawasm {
    type State = dex_io::State;

    fn token_addresses(state: Self::State) -> (FungibleId, FungibleId) {
        state.token_addresses()
    }

    fn reserves(state: Self::State) -> (u128, u128) {
        state.reserves()
    }

    fn prices(state: Self::State) -> (u128, u128) {
        state.prices()
    }

    fn balance_of(address: ActorId, state: Self::State) -> u128 {
        state.balance_of(address)
    }
}
```

### Interfaces
To successfully implement all the logic, we should provide additional math methods:
```rust
/// Calculates the amount of token1 for given amount of token0 and reserves
/// using the simple formula: amount1 = (amount0 * reserve1)/reserve0.
/// `reserve0` - MUST be a positive number
/// Arguments:
/// * `amount0` - the amount of token0
/// * `reserve0` - the amount of available token0
/// * `reserve1` - the amount of available token1
pub fn quote(amount0: u128, reserve0: u128, reserve1: u128) -> u128;

/// Calculates the amount of token1 for given amount of token0 and reserves.
/// Takes the fee of 3% into account, so the formula is:
/// amount1 = (amount0 * reserve1)/reserve1 * 0.997
/// Where * 0.997 is represented as * 997 / 1000
/// Arguments:
/// * `amount_in` - the amount of token0
/// * `reserve_in` - the amount of available token0
/// * `reserve_out` - the amount of available token1
pub fn get_amount_out(amount_in: u128, reserve_in: u128, reserve_out: u128) -> u128;

/// Calculates the amount of token0 for given amount of token1 and reserves.
/// Takes the fee of 3% into account, so the formula is:
/// amount1 = (amount0 * reserve1)/reseve1 * 0.997
/// Where * 0.997 is represented as * 997 / 1000
/// Arguments:
/// * `amount_in` - the amount of token0
/// * `reserve_in` - the amount of available token0
/// * `reserve_out` - the amount of available token1
pub fn get_amount_in(amount_out: u128, reserve_in: u128, reserve_out: u128) -> u128;
```
Now we can start implementing the contract. We start by introducing some of the internal methods to handle of the balances/reserves math:

```rust
// A simple wrapper for balance calculations to facilitate mint & burn.
fn update_balance(&mut self, to: ActorId, amount: u128, increase: bool);

// Mints the liquidity.
// `to` - MUST be a non-zero address
// Arguments:
// * `to` - is the operation performer
async fn mint(&mut self, to: ActorId) -> u128;

// Mint liquidity if fee is on.
// If fee is on, mint liquidity equivalent to 1/6th of the growth in sqrt(k). So the math if the following.
// Calculate the sqrt of current k using the reserves. Compare it.
// If the current one is greater, then calculate the liquidity using the following formula:
// liquidity = (total_supply * (root_k - last_root_k)) / (root_k * 5 + last_root_k).
// where root_k - is the sqrt of the current product of reserves, and last_root_k - is the sqrt of the previous product.
// Multiplication by 5 comes from the 1/6 of growth is sqrt.
// `reserve0` - MUST be a positive number
// `reserve1` - MUST be a positive number
// Arguments:
// * `reserve0` - the available amount of token0
// * `reserve1` - the available amount of token1
async fn mint_fee(&mut self, reserve0: u128, reserve1: u128) -> bool;

// Updates reserves and, on the first call per block, price accumulators
// `balance0` - MUST be a positive number
// `balance1` - MUST be a positive number
// `reserve0` - MUST be a positive number
// `reserve1` - MUST be a positive number
// Arguments:
// * `balance0` - token0 balance
// * `balance1` - token1 balance
// * `reserve0` - the available amount of token0
// * `reserve1` - the available amount of token1
fn update(&mut self, balance0: u128, balance1: u128, reserve0: u128, reserve1: u128);

// Burns the liquidity.
// `to` - MUST be a non-zero address
// Arguments:
// * `to` - is the operation performer
async fn burn(&mut self, to: ActorId) -> (u128, u128);

// Swaps two tokens just by calling transfer_tokens from the token contracts.
// Also maintains the balances and updates the reservers to match the balances.
// `amount0` - MUST be more than self.reserve0
// `amount1` - MUST be more than self.reserve1
// `to` - MUST be a non-zero address
// Arguments:
// * `amount0` - amount of token0
// * `amount1` - amount of token1
// * `to` - is the operation performer
// * `forward` - is the direction. If true - user inputs token0 and gets token1, otherwise - token1 -> token0
async fn _swap(&mut self, amount0: u128, amount1: u128, to: ActorId, forward: bool);
```

After that we can move on with the external methods implementation to cover all of the actions for our contract:

```rust
/// Forces balances to match the reserves.
/// `to` - MUST be a non-zero address
/// Arguments:
/// * `to` - where to perform tokens' transfers
pub async fn skim(&mut self, to: ActorId);

/// Forces reserves to match balances.
pub async fn sync(&mut self);

/// Adds liquidity to the pool.
/// `to` - MUST be a non-zero address
/// Arguments:
/// * `amount0_desired` - is the desired amount of token0 the user wants to add
/// * `amount1_desired` - is the desired amount of token1 the user wants to add
/// * `amount0_min` - is the minimum amount of token0 the user wants to add
/// * `amount1_min` - is the minimum amount of token1 the user wants to add
/// * `to` - is the liquidity provider
pub async fn add_liquidity(
    &mut self,
    amount0_desired: u128,
    amount1_desired: u128,
    amount0_min: u128,
    amount1_min: u128,
    to: ActorId,
);

/// Removes liquidity from the pool.
/// Internally calls self.burn function while transferring `liquidity` amount of internal tokens
/// `to` - MUST be a non-zero address
/// Arguments:
/// * `liquidity` - is the desired liquidity the user wants to remove (e.g. burn)
/// * `amount0_min` - is the minimum amount of token0 the user wants to receive
/// * `amount1_min` - is the minimum amount of token1 the user wants to receive
/// * `to` - is the liquidity provider
pub async fn remove_liquidity(
    &mut self,
    liquidity: u128,
    amount0_min: u128,
    amount1_min: u128,
    to: ActorId,
);

/// Swaps exact token0 for some token1
/// Internally calculates the price from the reserves and call self._swap
/// `to` - MUST be a non-zero address
/// `amount_in` - MUST be non-zero
/// Arguments:
/// * `amount_in` - is the amount of token0 user want to swap
/// * `to` - is the receiver of the swap operation
pub async fn swap_exact_tokens_for(&mut self, amount_in: u128, to: ActorId);

/// Swaps exact token1 for some token0
/// Internally calculates the price from the reserves and call self._swap
/// `to` - MUST be a non-zero address
/// `amount_in` - MUST be non-zero
/// Arguments:
/// * `amount_out` - is the amount of token1 user want to swap
/// * `to` - is the receiver of the swap operation
pub async fn swap_tokens_for_exact(&mut self, amount_out: u128, to: ActorId);
```

### Source code
The source code of this example of DEX pair smart contract and the example of an implementation of its testing is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/dex).

See also an example of the smart contract testing implementation based on `gtest`: [dex/tests](https://github.com/gear-foundation/dapps/tree/master/contracts/dex/tests).

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
