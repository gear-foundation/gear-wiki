---
sidebar_label: Executable functions
sidebar_position: 1
---

# Executable functions

The program is the main unit of the Gear Protocol. Each program in the Gear network is an immutable [WASM](/docs/gear/technology/WASM) blob and has a fixed amount of memory which persists between message handling (so-called static area).

## Basic structure

Any program can contain up to 3 entry points that perform various functions in the program lifecycle: `init()`, `handle()`, `handle_reply()`. All of them are optional, but any program required to have at least one fn: init() or handle().

Another special system entry point introduced by the Gear Protocol is `handle_signal()`. It allows the system to communicate with programs if it is necessary to notify (signal) that some event related to the program's messages has happened.

### init()

Optional `init()` function is called only once during program initialization and handles the incoming init payload if any.

```rust

#[no_mangle]
extern "C" fn init() {
    // execute this code during contract initialization
}

```

### handle()

The `handle()` function (also optional) will be called every time the program receives an incoming message. In this case, the payload will be processed.

```rust

#[no_mangle]
extern "C" fn handle() {
    // execute this code during explicitly incoming message
}

```

### handle_reply()


Processing the reply to the message in the Gear program is performed using the `handle_reply` function.

```rust

#[no_mangle]
extern "C" fn handle_reply() {
    // execute this code during handling reply on the previously sent message
}

```
