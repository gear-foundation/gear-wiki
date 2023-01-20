---
sidebar_label: PING-PONG
sidebar_position: 2
---

# PING-PONG

Gear is very easy to write code for!

Let's look at the [minimal program](https://github.com/gear-dapps/app/). It contains the following files:
```
.
├── io /
│   ├── src /
│   │   └── lib.rs
│   └── Cargo.toml
├── src/
│   ├── contract.rs
│   └── lib.rs
├── state/
│   ├── src/
│   │   ├── lib.rs
│   │   └── state.rs
│   ├── Cargo.toml
│   └── build.rs
├── tests/
│   ├── gclient_test.rs
│   └── test.rs
├── Cargo.toml
├── Makefile
├── meta.txt
└── build.rs
```
The code of the program is in the `src/contract.rs` file. The program replies with `Pong` string if the sender sent `Ping` message to it. It also saves how many times a user sent a ping message to the program.  
So, the program contains:
- state definition:
```rust
static mut STATE: Option<HashMap<ActorId, u128>> = None;
```
- `init` and `handle` entrypoints:
```rust
#[no_mangle]
extern "C" fn init() {
    unsafe { STATE = Some(HashMap::new()) }
}

#[no_mangle]
extern "C" fn handle() {
    process_handle()
        .expect("Failed to load, decode, encode, or reply with `PingPong` from `handle()`")
}

fn process_handle() -> Result<(), ContractError> {
    let payload = msg::load()?;

    if let PingPong::Ping = payload {
        let pingers = static_mut_state();

        pingers
            .entry(msg::source())
            .and_modify(|ping_count| *ping_count = ping_count.saturating_add(1))
            .or_insert(1);

        reply(PingPong::Pong)?;
    }

    Ok(())
}
```
- `state` function that allows to read the program state:
```rust
#[no_mangle]
extern "C" fn state() {
    reply(common_state()).expect(
        "Failed to encode or reply with `<ContractMetadata as Metadata>::State` from `state()`",
    );
}
```
-  `metahash()` function that returns the metadata hash:
```rust
#[no_mangle]
extern "C" fn metahash() {
    reply(include!("../.metahash"))
        .expect("Failed to encode or reply with `[u8; 32]` from `metahash()`");
}
```

The `lib.rs` file in the `src` directory contains the following code:
```
#![no_std]

#[cfg(not(feature = "binary-vendor"))]
mod contract;

#[cfg(feature = "binary-vendor")]
include!(concat!(env!("OUT_DIR"), "/wasm_binary.rs"));
```
This will include the generated WASM binary as 3 constants: WASM_BINARY, WASM_BINARY_OPT and WASM_BINARY_META in the root crate. These constants can be used instead of paths to wasm files in the target directory. You may not use that approach and simply write the contract code in the `lib.rs` file.

The `io` crate defines the contract metadata, namely, the state of the program and what messages the program receives and sends.
```rust
#[derive(Encode, Decode, TypeInfo, Hash, PartialEq, PartialOrd, Eq, Ord, Clone, Copy, Debug)]
pub enum PingPong {
    Ping,
    Pong,
}

pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = ();
    type Handle = InOut<PingPong, PingPong>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = State;
}

#[derive(Encode, Decode, TypeInfo, Hash, PartialEq, PartialOrd, Eq, Ord, Clone, Debug, Default)]
pub struct State(pub Vec<(ActorId, u128)>);
```
The `ContractMetadata` struct is used in `build.rs` in order to generate `meta.txt` file:
```rust
use app_io::ContractMetadata;

fn main() {
    gear_wasm_builder::build_with_metadata::<ContractMetadata>();
}
```

The `state` is the independent crate for reading the program state. It depends on the `app-io` crate where the type of the contract state is defined:
```rust
use app_io::*;
use gmeta::{metawasm, Metadata};
use gstd::{prelude::*, ActorId};

#[metawasm]
pub trait Metawasm {
    type State = <ContractMetadata as Metadata>::State;

    fn pingers(state: Self::State) -> Vec<ActorId> {
        state.pingers()
    }

    fn ping_count(actor: ActorId, state: Self::State) -> u128 {
        state.ping_count(actor)
    }
}
``` 

In the tests directory you can see an example of testing the  program using `gclient` and `gtest`. For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.