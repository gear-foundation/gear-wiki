---
sidebar_label: "Program state"
sidebar_position: 1
---

# Gear program state

The program is the main unit of the Gear component. Program code is stored as an immutable Wasm blob. Each program has a fixed amount of memory which persists between messagehandling (so-called static area).

The minimum structure of the Gear program is this:

```rust
#![no_std]

use gstd::msg;

#[no_mangle]
pub unsafe extern "C" fn handle() {
    msg::reply(b"Hello world!", 0, 0);
}

#[no_mangle]
pub unsafe extern "C" fn init() {}

```

The `init()` function is called only once during program initialization. And handles the incoming `init payload` if there is one.

The `handle()` function will be called every time the program receives an incoming message. In this case, the `payload` will be processed.
