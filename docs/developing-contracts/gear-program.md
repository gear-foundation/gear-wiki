---
sidebar_label: Executable functions
sidebar_position: 2
---

# Executable functions

The program is the main unit of the Gear component. Each program is immutable [WASM](/docs/gear/technology/WASM) blob and has a fixed amount of memory which persists between messagehandling (so-called static area).

## Basic structure

Any program can contain up to 3 entry points that perform various functions in the program lifecycle: `init()`, `handle()`, `handle_reply()`. All of them are optional.

### Init()

Optional `init()` function is called only once during program initialization and handles the incoming init payload if any.

```rust

#[no_mangle]
pub unsafe extern "C" fn init() {
    // execute this code during contract initialization
}

```

### handle()

The `handle()` function (also optional) will be called every time the program receives an incoming message. In this case, the payload will be processed.

```rust

#[no_mangle]
pub unsafe extern "C" fn handle() {
    // execute this code during message incoming
}

```

### handle_reply()

Processing the reply to the message in Gear program is performed using `handle_reply` function.

```rust

use gstd::msg;

unsafe extern "C" fn handle_reply() {
    // execute this code during message reply
}

```

