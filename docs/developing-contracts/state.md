---
sidebar_label: State Functions
sidebar_position: 4
---

# Store data

Persistent data of the Gear smart contract is stored in the same way as in a classic program and does not require initialization of the external storage.

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

If you're programming in Rust or other object-oriented languages, you should be familiar with most types. However, the `ActorId` type is something new when developing contracts via the Gear Protocol.

:::info
`ActorId` is a special type that represents an 32 bytes array and defines any `ID` in Gear Protocol.
:::

## State functions

To display the contract State information (similar to the `view` functions), the `state()` function is used. It allows you to instantly read the contract status (for example, contract balance). Reading State is a free function and does not require gas costs.

To return State use:

```rust
#[no_mangle]
extern "C" fn state() {
    msg::reply(unsafe { WALLETS.clone() }, 0).expect("Failed to share state");
}
```

By default, the `state()` function returns the whole state of the contract.

## Custom program to read the state

Additionally, you can create your own program to read the state. This wrapper will allow you to implement custom functions for the client side, not depending on the main program.

This has a number of advantages, for example, you will always be able to read the state even if the program changes (as long as the incoming or outgoing types have not changed). Or you are creating a service based on an already existing program and you need some of your own functions to get your own chanks of data from the state.

To do this, we need to create an independent program and describe the necessary functions inside the `metawasm` trait. For example:

```rust
// ...
use gmeta::metawasm;

#[metawasm]
pub mod metafns {
    pub type State = Vec<Wallet>;

    pub fn all_wallets(state: State) -> Vec<Wallet> {
        state
    }

    pub fn first_wallet(state: State) -> Option<Wallet> {
        state.first().cloned()
    }

    pub fn last_wallet(state: State) -> Option<Wallet> {
        state.last().cloned()
    }
}
```

Or more complex example:

```rust
// ...
use gmeta::metawasm;

#[metawasm]
pub mod metafns {
    pub type State = Vec<Wallet>;

    pub fn wallet_by_id(state: State, id: Id) -> Option<Wallet> {
        state.into_iter().find(|w| w.id == id)
    }

    pub fn wallet_by_person(state: State, person: String) -> Option<Wallet> {
        state.into_iter().find(|w| w.person == person)
    }
}
```

To build `meta.wasm`, the following `build.rs` file in the root of your project is required:

```rust
fn main() {
    gear_wasm_builder::build_metawasm();
}
```

[Learn more](/docs/developing-contracts/metadata/) how `metadata` works.
