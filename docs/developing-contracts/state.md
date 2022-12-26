---
sidebar_label: State Functions
sidebar_position: 3
---

# Store data

Persistent data of the Gear smart contract is stored in the same way as in a classic program and does not require initialization of the external storage.

```rust

// describe State structure
#[derive(TypeInfo, Decode, Encode, Clone)]
pub struct Wallet {
    pub id: ActorId,
    pub person: String,
}


// declare and initialize State
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

By default, the `state()` function returns the full State of the contact. Additionally, you can create custom State functions that can later be used on the client side.

To do this, we need to describe the necessary functions inside `metawasm` trait. For example:

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

Or more complex example:

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

[Learn more](/developing-contracts/metadata) how `metadata` works.