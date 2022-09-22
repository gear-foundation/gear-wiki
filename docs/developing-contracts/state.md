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

// initialize state itsalfe
static mut STATE: State = State::new();
```

If you program in Rust or other object-oriented languages, then you should be familiar with most types. However `ActorId` type shoud be new in Gear contract development.

:::info
`ActorId` is a special type 
:::

## State functions

To display the contact status information, by analogy with the "view" Gear functions, `meta_state()` is used, which allows you to instantly read the contact status (for example, balance) without any costs.

```rust
// The function that returns a part of memory with a state
#[no_mangle]
pub unsafe extern "C" fn meta_state() -> *mut [i32; 2] {

}
```



