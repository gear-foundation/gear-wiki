---
sidebar_label: Gear library
sidebar_position: 2
---

# Gear library

Gear library `gstd` provides all the necessary and sufficient functions and methods for develop smart-contracts.

## Message handing

Gear allows users and programs to interact with other users and programs via messages. Messages can contain a `payload` that will be able to be processed during message executione. Interaction with messages is possible thanks to the module `msg`

```rust
use gstd::msg;
```

Message processing is possible only inside the defined functions `init()`, `handle()` and `hadle_reply()`. They also define the context for processing such messages.


- Get a payload of the message currently being processed and decode it.

```rust
use gstd::msg;

unsafe extern "C" fn handle() {
    let payload_string: String = msg::load().expect("Unable to decode `String`");
}
```

- Reply with payload

```rust
use gstd::msg;

unsafe extern "C" fn handle() {
    msg::reply("PONG", 0).expect("Unable to decode `String`");
}
```

- Send message to user

```rust
use gstd::{msg, ActorId};

unsafe extern "C" fn handle() {
    // ...
    let id = msg::source();
    let message_string: String = "Hello there"
    msg::send(id, message_string, 0).expect("Unable to send message");
}
```

You can see more cases of using `msg` module in our [docs](https://docs.gear.rs/gstd/msg/index.html)

## Sys call's

Also in your programs, you can use some system calls related to the program execution flow.

```rust
use gstd::exec;
```

- Send a reply after the block timestamp reaches the indicated date

```rust
use gstd::{exec, msg};

unsafe extern "C" fn handle() {
        if exec::block_timestamp() >= 1645488000000 {
        msg::reply(b"The current block is generated after June 21, 2022", 0).expect("Unable to reply");
    }
}
```

- Get self value balance in program

```rust
use gstd::exec;

// Get self value balance in program
unsafe extern "C" fn handle() {
    let _my_balance = exec::value_available();
}
```

You can read more about program sys calls [here](https://docs.gear.rs/gstd/exec/index.html)

## Prelude::*

The `gstd` default prelude. Re-imports default std modules and traits. std can be safely replaced to `gstd  in the Rust programs.

See more [here](https://docs.gear.rs/gstd/prelude/index.html)

## Debug::*

Macro `gstd::debug` provide ability to debug contract during program execution

```rust

#![no_std]

use gstd::{debug, msg};

#[no_mangle]
pub unsafe extern "C" fn handle() {
   let payload_string: String = msg::load().expect("Unable to decode `String`");

    debug!("{:?} recived message: ", payload_string);
}

```
