---
sidebar_label: Oracle
sidebar_position: 23
---

# Gear Oracle

## What is Oracle?

Blockchain oracles are a combination of smart contracts and off-chain entities that connect blockchains to external systems(api, etc..), allowing other smart contracts to execute depending on real-world inputs and outputs. Oracles give the Web3 ecosystem a method to connect to existing legacy systems, data sources and advanced calculations.

These smart contracts can then be used to obtain external data which can't exist in blockchain space. In general oracles are used for:
- Fetching aggregated tokens prices in fiat (USD, EUR, etc..)
- Quering Web2 API
- Obtaining prices for different securities

Moreover, oracles allow the creation of lending / DEX protocols, which form an important part of DeFi.

Gear provides an example of the native implementation of randomness oracle, which provides an ability to use random numbers in smart contracts. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own oracle and run it on the Gear Network. The source code is available on [GitHub](https://github.com/gear-dapps/oracle).

## Storage Structure

```rust
#[derive(Debug, Default)]
pub struct RandomnessOracle {
    pub owner: ActorId,
    pub values: BTreeMap<u128, state::Random>,
    pub last_round: u128,
    pub manager: ActorId,
}
```

### `Action` and `Event`

`Event` is generated when `Action` is triggered. `Action` enum wraps various `Input` structs, `Event` wraps `Reply`.

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum Action {
    SetRandomValue { round: u128, value: state::Random },
    GetLastRoundWithRandomValue,
    UpdateManager(ActorId),
}
```

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum Event {
    NewManager(ActorId),
    NewRandomValue {
        round: u128,
        value: state::Random,
    },
    LastRoundWithRandomValue {
        round: u128,
        random_value: state::RandomSeed,
    },
}
```

### Message/Reply structures used in `Action` and `Event`

```rust
/// Used to represent high and low parts of unsigned 256-bit integer.
pub type RandomSeed = (u128, u128);
```

```rust
#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub struct Random {
    pub randomness: RandomSeed,
    pub signature: String,
    pub prev_signature: String,
}
```

## Oracle functions

```rust
    /// `Manager` method for specifying `value` for provided `round`.
    pub fn set_random_value(&mut self, round: u128, value: &state::Random)

    /// Updates current `manager` to `new_manager`.
    pub fn update_manager(&mut self, new_manager: &ActorId)
```

## Conclusion

A source code of the contract example provided by Gear is available on GitHub: [oracle/randomness-oracle/src/lib.rs](https://github.com/gear-dapps/oracle/blob/wip/randomness-oracle/src/lib.rs).

See also an example of the smart contract testing implementation based on `gtest`: [oracle/randomness-oracle/tests/randomness_oracle.rs](https://github.com/gear-dapps/oracle/blob/wip/randomness-oracle/tests/randomness_oracle.rs).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
