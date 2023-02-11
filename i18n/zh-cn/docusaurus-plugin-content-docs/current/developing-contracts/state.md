---
sidebar_label: State 函数
sidebar_position: 4
---

# 存储数据

Gear 智能合约的持久化数据的存储方式与传统程序相同，不需要初始化外部存储。

```rust
// ...
// describe state structure
#[derive(TypeInfo, Decode, Encode, Clone)]
pub struct Wallet {
    pub id: ActorId,
    pub person: String,
}

// declare and initialize the state
static mut WALLETS: Vec<Wallet> = Vec::new();
```

如果用 Rust 或其他面向对象的语言编程，你应该对大多数类型都很熟悉。然而，在 Gear 上开发合约时，`ActorId` 类型是一个新内容。

:::info
`ActorId` 是一个特殊的类型，代表一个 32 字节的数组，并定义了 Gear Protocol 中所有的 `ID`。
:::

## State 函数

为了显示合约状态信息（类似于`view`函数），使用 `state()` 函数。它可以立即读取合约状态（例如，余额）。读取状态是一个免费函数，不需要消耗任何 gas。

要返回 State 使用：

```rust
#[no_mangle]
extern "C" fn state() {
    msg::reply(unsafe { WALLETS.clone() }, 0).expect("Failed to share state");
}
```

默认情况下，`state()` 函数返合约的整体状态。

## 自定义程序读取状态

此外，你可以创建自己的程序来读取状态。这个包装器将允许你为客户端实现自定义函数，而不依赖于主程序。

这有很多优点，例如，即使程序改变了，也始终能够读取状态（只要输入或输出的类型没有改变）。或者你正在基于一个已经存在的程序创建服务，你需要一些自己的函数来从状态中获得你自己的数据块。

为此，我们需要创建一个独立的程序并在 `metawasm` 特征中描述必要的功能。例如：

```rust
// ...
use gmeta::metawasm;

#[metawasm]
pub trait Metawasm {
    type State = Vec<Wallet>;

    fn all_wallets(state: Self::State) -> Vec<Wallet> {
        state
    }

    fn first_wallet(state: Self::State) -> Option<Wallet> {
        state.first().cloned()
    }

    fn last_wallet(state: Self::State) -> Option<Wallet> {
        state.last().cloned()
    }
}
```

更多复杂的例子：

```rust
// ...
use gmeta::metawasm;

#[metawasm]
pub trait Metawasm {
    type State = Vec<Wallet>;

    fn wallet_by_id(id: Id, state: Self::State) -> Option<Wallet> {
        state.into_iter().find(|w| w.id == id)
    }

    fn wallet_by_person(person: String, state: Self::State) -> Option<Wallet> {
        state.into_iter().find(|w| w.person == person)
    }
}
```

要构建 `meta.wasm`，需要在项目根目录下设置 `build.rs` 文件：

```rust
fn main() {
    gear_wasm_builder::build_metawasm();
}
```

请看[更多](/docs/developing-contracts/metadata/)关于 `metadata`的内容。
