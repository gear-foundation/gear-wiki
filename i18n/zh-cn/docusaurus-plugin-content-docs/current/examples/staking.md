---
sidebar_label: 质押
sidebar_position: 17
---

# 质押

## 介绍

Stacking 类似于银行存款，由于加密货币的简单存储而获得被动收益。
收入的百分比可能不同 —— 这完全取决于存款的期限。

任何人都可以创建自己的 Staking 合约并在 Gear Network 上运行。Gear 创建了合约，在[GitHub](https://github.com/gear-dapps/staking)上查看。

本文解释了接口、数据结构、基本功能并解释了它们的用途。它可以直接使用或修改以适合自己的使用场景。

### 数学公式

你可以将同质化代币存入合约（因此你将代币存入质押合约），然后索取该代币（或其他同质化代币）以获得奖励。
在一定的时间间隔内（可以是一秒、一分钟或一天）产生固定数量的奖励。奖励在质押者之间公平分配。

如何工作：

Alice 质押 100 个代币，Bob 质押 50 个代币。在我们的示例中，让我们每分钟铸造一次奖励代币。质押合约内总共有 150 个代币。

一周后，爱丽丝决定取消抵押她的代币。Alice 代币质押的时间长度为 7 * 24 * 60。奖励代币的数量：

$$
R * \frac {100} {150} * 7 * 24 * 60
$$

又过了一周，Bob 也决定取消抵押他的 50 个代币。让我们计算一下他的奖励。在第一周，他从 150 个代币中质押了 50 个代币。在第二周，他从 50 个代币中质押了 50 个。他的奖励是：

$$
R * (\frac {50} {150} + \frac {50} {50}) * 7 * 24 * 60
$$

It is possible to generalize the formula:

$$
r(a, b) = R\sum_{t=a}^{t=b} \frac {l(t)} {L(t)}
$$

-	r(a, b) -  时间间隔内的用户奖励，并且 a <= t <= b
-	R - 每分钟的奖励
-	L(t) - 在时间 t 的代币总质押量
-	l(t) - 用户在时间 t 质押的代币

为了实现该公式，需要为每个用户和每个时间间隔存储 l(t)，为每个时间间隔存储 L(t)。为了计算奖励，我们必须为每个时间间隔运行一个 for 循环。该操作消耗大量 gas 和存储。我们用更有效的方式完成：

让用户的 l(t) 是常数 k，对于 a <= t <= b。然后：

$$
r(a, b) = R\sum_{t=a}^{t=b} \frac {l(t)} {L(t)} = Rk\sum_{t=a}^{t=b} \frac {1} {L(t)}
$$

公式可以进一步简化：

$$
\sum_{t=a}^{t=b} \frac {1} {L(t)} = \frac {1} {L(a)} + \frac {1} {L(a + 1)} + ... + \frac {1} {L(b)} =
$$

$$
\frac {1} {L(0)} + \frac {1} {L(1)} + ... + \frac {1} {L(b)} -
(\frac {1} {L(0)} + \frac {1} {L(1)} + ... + \frac {1} {L(a - 1)}) =
$$

$$
\sum_{t=0}^{t=b} \frac {1} {L(t)} - \sum_{t=0}^{t=a-1} \frac {1} {L(t)}
$$

因此，在他质押的代币数量不变的条件下，计算用户从 t=a 到 t=b 将获得的奖励金额的等式：

$$
Rk\sum_{t=a}^{t=b} \frac {1} {L(t)} = Rk(\sum_{t=0}^{t=b} \frac {1} {L(t)} - \sum_{t=0}^{t=a-1} \frac {1} {L(t)})
$$

基于该等式，智能合约中的实现可以写成：

```rust
(staker.balance * self.tokens_per_stake) / DECIMALS_FACTOR + staker.reward_allowed - staker.reward_debt - staker.distributed
```

### 合约

管理员通过发送有关质押代币、奖励代币和发放时间的信息（`InitStaking` 消息）来初始化合约。
管理员可以查看 Stakers 列表（`GetStakers` 消息）。管理员可以更新将要分发的奖励（`UpdateStaking` 消息）。
用户首先进行投注（`Stake`消息），然后他可以按要求获得奖励（`GetReward`消息）。用户可以提取部分金额（`Withdraw` 消息）。

## 接口
### 源文件
1. `staking/src/lib.rs` - 含有 'staking' 合约的功能。
2. `staking/io/src/lib.rs` - 包含合约在回复中接收和发送的 Enums 和结构。

### 结构
`Cargo.toml`
```toml
[dependecies]
# ...
hashbrown = "0.13.1"
```
该合约有以下结构：

```rust
use hashbrown::HashMap;

struct Staking {
    owner: ActorId,
    staking_token_address: ActorId,
    reward_token_address: ActorId,
    tokens_per_stake: u128,
    total_staked: u128,
    distribution_time: u64,
    produced_time: u64,
    reward_total: u128,
    all_produced: u128,
    reward_produced: u128,
    stakers: HashMap<ActorId, Staker>,
}
```

`owner` - 合约所有者

`staking_token_address` - staking 代币合约的地址

`reward_token_address` - 奖励代币合约的地址

`tokens_per_stake` - 每份抵押的代币计算值

`total_staked` - 抵押总额

`distribution_time` - 奖励的发放时间

`reward_total` - 在奖励发放时间内分配的奖励

`produced_time` - 更新  `reward_total` 的时间

`all_produced` - 更新前收到的奖励 `reward_total`

`reward_produced` - 迄今为止产生的总奖励

`stakers` - 抵押者列表


```rust
pub struct InitStaking {
    pub staking_token_address: ActorId,
    pub reward_token_address: ActorId,
    pub distribution_time: u64,
    pub reward_total: u128,
}
```

`staking_token_address` - 抵押代币合约的地址

`reward_token_address` - 奖励代币合约的地址

`distribution_time` -  奖励的发放时间

`reward_total` - 在奖励发放时间内分配的奖励

```rust
pub struct Staker {
    pub balance: u128,
    pub reward_allowed: u128,
    pub reward_debt: u128,
    pub distributed: u128,
}
```

`balance` - 抵押代币总数量

`reward_allowed` - 可以从提款金额中获得的奖励

`reward_debt` - 如果存款人最初支付了这笔款项，他将获得的奖励

`distributed` - 支付的激励总额

### 枚举

```rust
pub enum StakingAction {
    Stake(u128),
    Withdraw(u128),
    UpdateStaking(InitStaking),
    GetReward,
}

pub enum StakingEvent {
    StakeAccepted(u128),
    Withdrawn(u128),
    Updated,
    Reward(u128),
}

pub enum StakingState {
    GetStakers,
    GetStaker(ActorId),
}

pub enum StakingStateReply {
    Stakers(Vec<(ActorId, Staker)>),
    Staker(Staker),
}
```

### 方法

Staking 合约通过函数`transfer_tokens()` 与同质化代币合约进行交互。

```rust
pub async fn transfer_tokens(
    token_address: &ActorId, /// - the token address
	from: &ActorId, /// - the sender address
	to: &ActorId, /// - the recipient address
	amount_tokens: u128 /// - the amount of tokens
)
```

函数发送一条消息（action 在枚举`FTAction` 中定义）并获得回复（回复在枚举`FTEvent` 中定义）。

```rust
msg::send_for_reply(
    *token_address, /// - the fungible token contract address
    FTAction::Transfer {		/// - action in the fungible token-contract
        from: *from,
        to: *to,
        amount: amount_tokens,
    },
    0,
)
```

计算到目前为止产生的总奖励：

```rust
fn produced(&mut self) -> u128
```

更新到目前为止产生的奖励并计算每个股份的代币奖励：

```rust
fn update_reward(&mut self)
```

计算最大可能的奖励。

如果存款人最初支付了这笔款项，他将获得的奖励

```rust
fn get_max_reward(&self, amount: u128) -> u128
```

计算当前可用的抵押者的奖励。

根据算法返回值不能小于零
```rust
fn calc_reward(&mut self) -> u128
```

更新质押合约。

设置奖励在分发时间内分发
```rust
fn update_staking(&mut self, config: InitStaking)
```

抵押代币

```rust
async fn stake(&mut self, amount: u128)
```

向质押者发送奖励

```rust
async fn send_reward(&mut self)
```

提取质押的代币

```rust
async fn withdraw(&mut self, amount: u128)
```

这些函数在 `async fn main()` 中通过枚举 `StakingAction` 调用。

这是程序的入口点，程序会等待 `StakingAction` 格式的消息。

```rust
#[gstd::async_main]
async unsafe fn main() {
    let staking = unsafe { STAKING.get_or_insert(Staking::default()) };

    let action: StakingAction = msg::load().expect("Could not load Action");

    match action {
        StakingAction::Stake(amount) => {
            staking.stake(amount).await;
        }

        StakingAction::Withdraw(amount) => {
            staking.withdraw(amount).await;
        }

        StakingAction::SetRewardTotal(reward_total) => {
            staking.set_reward_total(reward_total);
            msg::reply(StakingEvent::RewardTotal(reward_total), 0).unwrap();
        }

        StakingAction::GetReward => {
            staking.send_reward().await;
        }
    }
}
```

能够在链下读取合约状态也很重要。它在`fn meta_state()` 中定义。合约收到读取特定数据的请求（可能的请求在 `StakingState` 中定义）并发送回复。合约关于其状态的回复在枚举`StakingStateReply`中定义。

```rust
#[no_mangle]
extern "C" fn meta_state() -> *mut [i32; 2] {
    let query: StakingState = msg::load().expect("failed to decode input argument");
    let staking = unsafe { STAKING.get_or_insert(Staking::default()) };

    let encoded = match query {
        StakingState::GetStakers => StakingStateReply::Stakers(staking.stakers.clone()).encode(),

        StakingState::GetStaker(address) => {
            if let Some(staker) = staking.stakers.get(&address) {
                StakingStateReply::Staker(*staker).encode()
            } else {
                panic!("meta_state(): Staker {:?} not found", address);
            }
        }
    };

    gstd::util::to_leak_ptr(encoded)
}
```

## 总结

A source code of the contract example provided by Gear is available on GitHub: [`staking/src/lib.rs`](https://github.com/gear-dapps/staking/blob/master/src/lib.rs).

合约源码在 Github 上可以找到：[`staking/src/lib.rs`](https://github.com/gear-dapps/staking/blob/master/src/lib.rs)。

本合约的测试代码基于 gtest：

- [`simple_test.rs`](https://github.com/gear-dapps/staking/blob/master/tests/simple_test.rs)

- [`panic_test.rs`](https://github.com/gear-dapps/staking/blob/master/tests/panic_test.rs)

更多关于在 Gear 上测试智能合约的细节，请参考这篇文章：[程序测试](/developing-contracts/testing.md) 。
