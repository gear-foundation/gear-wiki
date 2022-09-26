---
sidebar_label: State functions
sidebar_position: 3
---

# Store data

Persistent data of the Gear contact is stored in the same way as in a classic program and does not require initialization of the external storage.

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

// initialize state itsalfe
static mut STATE: State = State::new();
```

If you program in Rust or other object-oriented languages, then you should be familiar with most types. However `ActorId` type shoud be new in Gear contract development.

:::info
`ActorId` is a special type that represents an 32 bytes array and defines any `ID` in Gear
:::

## State functions

To display the contact status information, by analogy with the "view" Gear functions, `meta_state()` is used, which allows you to instantly read the contact status (for example, balance) without any costs.

```rust
// The function meta_state() returns a part of memory with a state
// In this example if payload is "CONTRACT_STATE" then returns state
#[derive(Encode, Decode, TypeInfo)]
pub struct ContractState {}

static mut STATE: ContractState = ContractState {};

#[no_mangle]
pub unsafe extern "C" fn meta_state() -> *mut [i32; 2] {
    let query = String::from_utf8(msg::load_bytes()).expect("Invalid query");
    let reply = if query == "CONTRACT_STATE" {
        let encoded = STATE.encode();
        gstd::util::to_leak_ptr(encoded)
    } else {
        gstd::util::to_leak_ptr(vec![])
    };
    reply
}
```



