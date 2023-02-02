---
sidebar_label: Asynchronous Programming
sidebar_position: 6
---

# Asynchronous programming

Asynchronous interaction between Gear programs is similar to the usual asynchronous request in using `await` and implemented by sending a message.

## Program entry points

If a program's logic implies asynchronous messaging, its main executable functions must differ from those used in synchronous communications.

### async_init()

In case of an asynchronous call in the program initialization, the `async_init()` must be used instead of `init()`:

```rust
#[gstd::async_init]
async fn init() {
    gstd::debug!("Hello world!");
}
```

### main()

The same for asynchronous messages, the `main` must be used instead of `handle` `handle_reply`:

```rust
#[gstd::async_main]
async fn main() {
    gstd::debug!("Hello world!");
}
```

:::info
`async_init` сan be used together with `async_main`. But functions `init`, `handle_reply` cannot be specified if this macro is used.
:::

# Cross-program message

To send a message to a Gear program, use the `send_for_reply(program, payload, value)` function. In this function:
- program - the address of the program to send the message for;
- payload - the message to the program;
- value - the funds attached to the message.

```rust
  pub fn send_for_reply_as<E: Encode, D: Decode>(
    program: ActorId,
    payload: E,
    value: u128
) -> Result<CodecMessageFuture<D>>
```
