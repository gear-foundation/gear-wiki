---
sidebar_label: Gear library
sidebar_position: 2
---

# Gear library

The Gear Protocol’s library `gstd` provides all the necessary and sufficient functions and methods for developing smart-contracts.

## Message handling

The Gear Protocol allows users and programs to interact with other users and programs via messages. Messages can contain a `payload` that will be able to be processed during message execution. Interaction with messages is possible thanks to the module `msg`:

```rust
use gstd::msg;
```

Message processing is possible only inside the defined functions `init()`, `handle()` and `hadle_reply()`. They also define the context for processing such messages.

- Get a payload of the message currently being processed and decode it:

```rust
use gstd::msg;

unsafe extern "C" fn handle() {
    let payload_string: String = msg::load().expect("Unable to decode `String`");
}
```

- Reply to the message with payload:

```rust
use gstd::msg;

unsafe extern "C" fn handle() {
    msg::reply("PONG", 0).expect("Unable to decode `String`");
}
```

- Send message to user:

```rust
use gstd::{msg, ActorId};

unsafe extern "C" fn handle() {
    // ...
    let id = msg::source();
    let message_string: String = "Hello there"
    msg::send(id, message_string, 0).expect("Unable to send message");
}
```

You can see more cases of using the `msg` module in our [documentation](https://docs.gear.rs/gstd/msg/index.html).

## Syscalls

System calls related to the program execution flow can be also used in your programs:

```rust
use gstd::exec;
```

- Send a reply after the block timestamp reaches the indicated date:

```rust
use gstd::{exec, msg};

unsafe extern "C" fn handle() {
        if exec::block_timestamp() >= 1645488000000 {
        msg::reply(b"The current block is generated after June 21, 2022", 0).expect("Unable to reply");
    }
}
```

- Get self value balance of a program:

```rust
use gstd::exec;

// Get self value balance in program
unsafe extern "C" fn handle() {
    let _my_balance = exec::value_available();
}
```

You can read more about program syscalls [here](https://docs.gear.rs/gstd/exec/index.html).

## Importing familiar types via prelude

The `gstd` default prelude lists things that Rust automatically imports into every program. It re-imports default `std` modules and traits. `std` can be safely replaced with `gstd in the Rust programs.

See more details [here](https://docs.gear.rs/gstd/prelude/index.html).

## Logging inside the contracts

Macro `gstd::debug` provides an ability to debug contract during program execution:

```rust

#![no_std]

use gstd::{debug, msg};

#[no_mangle]
pub unsafe extern "C" fn handle() {
   let payload_string: String = msg::load().expect("Unable to decode `String`");

    debug!("{:?} received message: ", payload_string);
}

```

