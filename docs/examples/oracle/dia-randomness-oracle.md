---
sidebar_label: Dia Randomness Oracle
sidebar_position: 2
---

# Dia Randomness Oracle

## Randomness in blockchain

Randomness in blockchains is important for a fair and unpredictable distribution of validator responsibilities. Computers are bad at random numbers because they are deterministic devices (the same input always produces the same output). What people usually call random numbers on a computer (such as in a gaming application), are pseudo-random - that is, they depend on a sufficiently random seed provided by the user or another type of oracle, like a weather station for atmospheric noise, your heart rate, or even lava lamps, from which it can generate a series of seemingly-random numbers. But given the same seed, the same sequence will always be generated.

However, there are distributed systems that try to solve the problem of "predictability" of randomness, one of them is [drand](https://drand.love/).

The given dia-oracle implementation is an example of a safe randomization.

## State

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

```rust
#[derive(Debug, Default, Clone, Encode, Decode, TypeInfo)]
pub struct RandomnessOracle {
    pub owner: ActorId,
    pub values: BTreeMap<u128, Random>,
    pub last_round: u128,
    pub manager: ActorId,
}
```

## Actions

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum Action {
    SetRandomValue { round: u128, value: state::Random },
    GetLastRoundWithRandomValue,
    UpdateManager(ActorId),
}
```

## Events

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

## Init configuration

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct InitConfig {
    pub manager: ActorId,
}
```

## Conclusion

A source code of the contract example provided by Gear is available on GitHub: [oracle/randomness-oracle/src/lib.rs](https://github.com/gear-foundation/dapps-oracle/blob/wip/randomness-oracle/src/lib.rs).

See also an example of the smart contract testing implementation based on `gtest`: [oracle/randomness-oracle/tests/randomness_oracle.rs](https://github.com/gear-foundation/dapps-oracle/blob/wip/randomness-oracle/tests/randomness_oracle.rs).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
