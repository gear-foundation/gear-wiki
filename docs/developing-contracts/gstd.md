---
sidebar_position: 2
---

# Gear Library

The Gear Protocol’s library `gstd` provides all the necessary and sufficient functions and methods for developing smart-contracts.

## Importing familiar types via prelude

The `gstd` default prelude lists things that Rust automatically imports into every program. It re-imports default `std` modules and traits. `std` can be safely replaced with `gstd` in the Gear programs on Rust.

See more details [here](https://docs.gear.rs/gstd/prelude/index.html).

## Message handling

The Gear Protocol allows users and programs to interact with other users and programs via messages. Messages can contain a `payload` that will be able to be processed during message execution. Interaction with messages is possible thanks to the module `msg`:

```rust
use gstd::msg;
```

Message processing is possible only inside the defined functions `init()`, `handle()`, `hadle_reply()`, and `state()`. They also define the context for processing such messages.

- Get a payload of the message currently being processed and decode it:

```rust
#![no_std]
use gstd::{msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {
    let payload_string: String = msg::load().expect("Unable to decode `String`");
}
```

- Reply to the message with payload:

```rust
#![no_std]
use gstd::msg;

#[no_mangle]
extern "C" fn handle() {
    msg::reply("PONG", 0).expect("Unable to reply");
}
```

- Send message to user:

```rust
#![no_std]
use gstd::{msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {
    // ...
    let id = msg::source();
    let message_string = "Hello there".to_string();
    msg::send(id, message_string, 0).expect("Unable to send message");
}
```

You can see more cases of using the `msg` module in our [documentation](https://docs.gear.rs/gstd/msg/index.html).

## Execution info

A program can get some useful information about the current execution context by using the `exec` module:

```rust
use gstd::exec;
```

- Send a reply after the block timestamp reaches the indicated date:

```rust
#![no_std]
use gstd::{exec, msg};

#[no_mangle]
extern "C" fn handle() {
    // Timestamp is in milliseconds since the Unix epoch
    if exec::block_timestamp() >= 1672531200000 {
        msg::reply(b"Current block has been generated after January 01, 2023", 0)
            .expect("Unable to reply");
    }
}
```

- Get self value balance of a program:

```rust
#![no_std]
use gstd::exec;

#[no_mangle]
extern "C" fn handle() {
    // Get self value balance in program
    let my_balance = exec::value_available();
}
```

You can read more about program syscalls [here](https://docs.gear.rs/gstd/exec/index.html).

## Logging inside the contracts

Macro `gstd::debug` provides an ability to debug contract during program execution:

```rust
#![no_std]
use gstd::{debug, msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {
    let payload_string: String = msg::load().expect("Unable to decode `String`");
    debug!("Received message: {payload_string:?}");
}
```

:::note

The `debug!` macro is available only when the `"debug"` feature is enabled for the `gstd` crate.

```toml
[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.0.1", features = ["debug"] }
```

:::
