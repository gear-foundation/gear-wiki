---
sidebar_label: Asynchronous programming
sidebar_position: 5
---

# Asynchronous programming

Asynchronous interaction between Gear programs is similar to the usual asynchronous request in using `await` and implemented by sending a message.

## Program entry points

if a program uses asynchronous messages, its main executable functions change

### async_init()

In case if there is an asynchronous call in the program initialization, then instead of `init()` we should use `async_init()`:

```rust
#[gstd::async_init]
async fn init() {
    gstd::debug!("Hello world!");
}
```

### main()

The same for asynchronous messages, instead of `handle` `handle_reply` we use `main`:

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

To send message to a Gear program use function `send_for_reply(program, payload, value)`, in this function:
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
