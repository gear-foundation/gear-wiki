---
sidebar_label: State functions
sidebar_position: 3
---

# Store data

Persistent data of the Gear smart contract is stored in the same way as in a classic program and does not require initialization of the external storage.

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

If you're programming in Rust or other object-oriented languages, you should be familiar with most types. However, the `ActorId` type is something new when developing contracts via the Gear Protocol.

:::info
`ActorId` is a special type that represents an 32 bytes array and defines any `ID` in Gear.
:::

## State functions

To display the contract status information (similar to the `view` Gear functions), the `meta_state()` is used. It allows you to instantly read the contract status (for example, balance). Reading state is a free function and it does not require any gas costs.

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
