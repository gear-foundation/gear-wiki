---
sidebar_label: Gear Oracle
sidebar_position: 1
---

# Gear Oracle

## What is Oracle?

Blockchain oracles are a combination of smart contracts and off-chain entities that connect blockchains to external systems(api, etc..), allowing other smart contracts to execute depending on real-world inputs and outputs. Oracles give the Web3 ecosystem a method to connect to existing legacy systems, data sources and advanced calculations.

These smart contracts can then be used to obtain external data which can't exist in blockchain space. In general oracles are used for:
- Fetching aggregated tokens prices in fiat (USD, EUR, etc..)
- Quering Web2 API
- Obtaining prices for different securities

Moreover, oracles allow the creation of lending / DEX protocols, which form an important part of DeFi.

Gear provides an example of the native implementation of randomness oracle, which provides an ability to use random numbers in smart contracts. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own oracle and run it on the Gear Network. The source code is available on [GitHub](https://github.com/gear-foundation/dapps-oracle).

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
    RequestValue,
    ChangeManager(ActorId),
}
```

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum Event {
    NewValue { value: u128 },
    NewManager(ActorId),
}
```

## Conclusion

A source code of the contract example provided by Gear is available on GitHub: [oracle/oracle/src/contract.rs](https://github.com/gear-foundation/dapps-oracle/blob/wip/oracle/src/contract.rs).

See also an example of the smart contract testing implementation based on `gtest` and `gclient`: [oracle/oracle/tests](https://github.com/gear-foundation/dapps-oracle/tree/wip/oracle/tests).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
