---
sidebar_label: PING-PONG
sidebar_position: 2
---

# PING-PONG

Gear is very easy to write code for!

This is the minimal program for a classic ping-pong contract:

```rust
#![no_std]

use gstd::{debug, msg, prelude::*};

static mut MESSAGE_LOG: Vec<String> = vec![];

#[no_mangle]
unsafe extern "C" fn handle() {
    let new_msg = String::from_utf8(msg::load_bytes().expect("Unable to load bytes"))
        .expect("Invalid message");

    if new_msg == "PING" {
        msg::reply_bytes("PONG", 0).unwrap();
    }

    MESSAGE_LOG.push(new_msg);

    debug!("{:?} total message(s) stored: ", MESSAGE_LOG.len());

    for log in MESSAGE_LOG.iter() {
        debug!(log);
    }
}

/// and a simple unit test:

#[cfg(test)]
mod tests {
    extern crate std;

    use gtest::{Log, Program, System};

    #[test]
    fn it_works() {
        let system = System::new();
        system.init_logger();

        let program = Program::current(&system);

        let res = program.send_bytes(42, "INIT");
        assert!(res.log().is_empty());

        let res = program.send_bytes(42, "PING");
        let log = Log::builder().source(1).dest(42).payload_bytes("PONG");
        assert!(res.contains(&log));
    }
}
```

## Program metadata and state
Metadata interface description:

```rust
pub struct DemoPingMetadata;

impl Metadata for DemoPingMetadata {
    type Init = ();
    type Handle = InOut<Vec<u8>, Vec<u8>>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = Vec<String>;
}
```
To display the full contract state information, the `state()` function is used:

```rust
#[no_mangle]
extern "C" fn state() {
    msg::reply(unsafe { MESSAGE_LOG.clone() }, 0)
        .expect("Failed to encode or reply with `<AppMetadata as Metadata>::State` from `state()`");
}
```
To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `Vec<String>` state. For example - [gear-dapps/ping/state](https://github.com/gear-dapps/ping/tree/master/state):

```rust
#[metawasm]
pub trait Metawasm {
    type State = <DemoPingMetadata as Metadata>::State;

    fn get_first_message(state: Self::State) -> String {
        ...
    }

    fn get_last_message(state: Self::State) -> String {
        ...
    }

    fn get_messages_len(state: Self::State) -> u64 {
        ...
    }

    fn get_message(index: u64, state: Self::State) -> String {
        ...
    }
}
```

## Overview
The program just sends `PONG` back to the original sender who sent `PING` to it.

GitHub link: https://github.com/gear-dapps/ping
