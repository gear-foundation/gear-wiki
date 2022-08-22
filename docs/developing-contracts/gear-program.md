---
sidebar_label: Program State
sidebar_position: 2
---

# Gear program state

The program is the main unit of the Gear component. Program code is stored as an immutable WASM blob. Each program has a fixed amount of memory which persists between messagehandling (so-called static area).

The minimum structure of the Gear program is this:

```rust
#![no_std]

use gstd::msg;

#[no_mangle]
pub unsafe extern "C" fn handle() {
    msg::reply(b"Hello world!", 0).expect("Error in sending reply");
}

#[no_mangle]
pub unsafe extern "C" fn init() {}

```

Optional `init()` function is called only once during program initialization and handles the incoming init payload if any.

The `handle()` function (also optional) will be called every time the program receives an incoming message. In this case, the payload will be processed.
