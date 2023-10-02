---
sidebar_label: PING-PONG
sidebar_position: 2
---

# PING-PONG

Gear is very easy to write code for!

Let's look at the [minimal program](https://github.com/gear-foundation/dapps/tree/master/contracts/ping).

The code of the program is in the `src/lib.rs` file. The program replies with `Pong` string if the sender sent `Ping` message to it. It also saves how many times a user sent a ping message to the program.
So, the program contains:
- message log definition:
```rust title="ping/src/lib.rs"
static mut MESSAGE_LOG: Vec<String> = vec![];
```
- entry point `handle`:
```rust title="ping/src/lib.rs"
#[no_mangle]
extern fn handle() {
    let new_msg: String = msg::load().expect("Unable to create string");

    if new_msg == "PING" {
        msg::reply_bytes("PONG", 0).expect("Unable to reply");
    }

    unsafe {
        MESSAGE_LOG.push(new_msg);

        debug!("{:?} total message(s) stored: ", MESSAGE_LOG.len());

        for log in &MESSAGE_LOG {
            debug!("{log:?}");
        }
    }
}
```
- `state` function that allows to read the program state:
```rust title="ping/src/lib.rs"
#[no_mangle]
extern fn state() {
    msg::reply(unsafe { MESSAGE_LOG.clone() }, 0)
        .expect("Failed to encode or reply with `<AppMetadata as Metadata>::State` from `state()`");
}
```

The `io` crate defines the contract metadata.
```rust title="ping/io/src/lib.rs"
#![no_std]

use gmeta::{InOut, Metadata, Out};
use gstd::prelude::*;

pub struct DemoPingMetadata;

impl Metadata for DemoPingMetadata {
    type Init = ();
    type Handle = InOut<String, String>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = Out<Vec<String>>;
}
```
The `DemoPingMetadata` struct is used in `build.rs` in order to generate `meta.txt` file:
```rust title="ping/build.rs"
use ping_io::DemoPingMetadata;

fn main() {
    gear_wasm_builder::build_with_metadata::<DemoPingMetadata>();
}
```

The `state` is the independent crate for reading the program state. It depends on the `ping-io` crate where the type of the contract state is defined:
```rust title="ping/state/src/lib.rs"
#![no_std]

use gstd::prelude::*;

#[gmeta::metawasm]
pub mod metafns {
    pub type State = Vec<String>;

    pub fn get_first_message(state: State) -> String {
        state.first().expect("Message log is empty!").to_string()
    }

    pub fn get_last_message(state: State) -> String {
        state.last().expect("Message log is empty!").to_string()
    }

    pub fn get_messages_len(state: State) -> u64 {
        state.len() as u64
    }

    pub fn get_message(state: State, index: u64) -> String {
        state
            .get(index as usize)
            .expect("Invalid index!")
            .to_string()
    }
}
```

In the tests directory you can see an example of testing the  program using `gclient` and `gtest`. For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
