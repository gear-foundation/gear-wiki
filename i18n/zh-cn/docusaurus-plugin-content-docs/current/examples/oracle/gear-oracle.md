---
sidebar_label: Gear 预言机
sidebar_position: 1
---

# Gear 预言机

## 什么是预言机？

区块链预言机是智能合约和链外实体的组合，将区块链连接到外部系统（API 等），允许其他智能合约可以根据真实世界的输入和输出执行。预言机为 Web3 生态系统提供了一种方法来连接到既有的遗留系统、数据来源和先进的计算。

这些智能合约可以用来获取不存在区块链中的外部数据。一般来说，预言机用于：
- 获取代币的法定货币价格（美元、欧元等）
- 查询 Web2 API
- 获取不同证券的价格

此外，预言机允许创建借贷、DEX 协议，这构成了 DeFi 的一个重要部分。

Gear 提供了一个随机性预言机的实现，它提供了在智能合约中使用随机数的能力。你可以直接使用，也可以根据场景进行修改。任何人都可以轻松地创建自己的预言机并在 Gear Network 上运行。源代码在 [GitHub](https://github.com/gear-dapps/oracle)。

## 合约结构

```rust
#[derive(Debug, Default)]
pub struct RandomnessOracle {
    pub owner: ActorId,
    pub values: BTreeMap<u128, state::Random>,
    pub last_round: u128,
    pub manager: ActorId,
}
```

### `Action` 和 `Event`

触发 `Action` 时会生成 `Event`。 `Action` 枚举包装了各种 `Input` 结构，`Event` 包装了 `Reply`。

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

### `Action` 和 `Event` 的数据结构

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

## 预言机方法

```rust
    /// `Manager` method for specifying `value` for provided `round`.
    pub fn set_random_value(&mut self, round: u128, value: &state::Random)

    /// Updates current `manager` to `new_manager`.
    pub fn update_manager(&mut self, new_manager: &ActorId)
```

## 总结

本合约实现在 GitHub [oracle/randomness-oracle/src/lib.rs](https://github.com/gear-dapps/oracle/blob/wip/randomness-oracle/src/lib.rs)。

同样可以找到基于 `gtest` 实现的智能合约测试范例：`gtest`: [oracle/randomness-oracle/tests/randomness_oracle.rs](https://github.com/gear-dapps/oracle/blob/wip/randomness-oracle/tests/randomness_oracle.rs)

更多关于在 Gear 上测试智能合约的细节，请参考这篇文章：[应用测试](https://wiki.gear-tech.io/zh-cn/developing-contracts/testing/)。
