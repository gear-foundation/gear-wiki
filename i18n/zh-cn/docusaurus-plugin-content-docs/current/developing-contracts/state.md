---
sidebar_label: State 函数
sidebar_position: 3
---

# 存储数据

Gear 智能合约的持久化数据的存储方式与传统程序相同，不需要初始化外部存储。

```rust
// describe state structure
pub struct State {
    votes_received: BTreeMap<String, i32>,
}

impl State {
    // Create a state
    pub const fn new() -> Self {
        Self {
            votes_received: BTreeMap::new(),
        }
    }
}

// initialize state itself
static mut STATE: State = State::new();
```

如果用 Rust 或其他面向对象的语言编程，你应该对大多数类型都很熟悉。然而，在 Gear 上开发合约时，`ActorId` 类型是一个新内容。

:::info
`ActorId` 是一个特殊的类型，代表一个 32 字节的数组，并定义了 Gear 中的任何 `ID`。
:::

## State functions

为了显示合约状态信息（类似于 `view` Gear 函数），使用了 `meta_state()`。它允许您立即读取合约状态（例如，余额）。读取状态是一个免费函数，不需要消耗任何 gas 费用。

```rust
// The function meta_state() returns a part of memory with a state
// In this example if payload is "CONTRACT_STATE" then it returns state
#[derive(Encode, Decode, TypeInfo)]
pub struct ContractState {}

static mut STATE: ContractState = ContractState {};

#[no_mangle]
pub unsafe extern "C" fn meta_state() -> *mut [i32; 2] {
    let query = String::from_utf8(msg::load_bytes().unwrap()).expect("Invalid query");
    let reply = if query == "CONTRACT_STATE" {
        let encoded = STATE.encode();
        gstd::util::to_leak_ptr(encoded)
    } else {
        gstd::util::to_leak_ptr(vec![])
    };
    reply
}
```