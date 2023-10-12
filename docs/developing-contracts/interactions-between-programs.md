---
sidebar_label: Asynchronous Programming
sidebar_position: 6
---

# Asynchronous Programming

Asynchronous interaction between Gear programs is similar to the usual asynchronous request in using `await` and implemented by sending a message.

## Program entry points

If a program's logic implies asynchronous messaging, its main executable functions must differ from those used in synchronous communications.

### async init()

In case of an asynchronous call in the program initialization, the `async init()` must be used instead of `init()`. Also, it should be preceded by the [`gstd::async_init`](https://docs.gear.rs/gstd/attr.async_init.html) macro:

```rust
#[gstd::async_init]
async fn init() {
    gstd::debug!("Hello world!");
}
```

### async main()

The same for asynchronous messages, the `async main()` must be used instead of `handle()` and `handle_reply()`. Also, it should be preceded by the [`gstd::async_main`](https://docs.gear.rs/gstd/attr.async_main.html) macro:

```rust
#[gstd::async_main]
async fn main() {
    gstd::debug!("Hello world!");
}
```

:::info

`async init` сan be used together with `async main`. But functions `init`, `handle_reply` cannot be specified if this macro is used.

:::

# Cross-program message

To send a message to a Gear program, use the [`msg::send_for_reply()`](https://docs.gear.rs/gstd/msg/fn.send_for_reply.html) function. In this function:

- `program` - the address of the program to send the message for;
- `payload` - the message to the program;
- `value` - the funds attached to the message (zero if no value is attached);
- `reply_deposit` - used to provide gas for future reply handling (skipped if zero).

To get an encoded reply from another actor use the [`msg::send_for_reply_as()`](https://docs.gear.rs/gstd/msg/fn.send_for_reply_as.html) function.

```rust
pub fn send_for_reply_as<E: Encode, D: Decode>(
    program: ActorId,
    payload: E,
    value: u128,
    reply_deposit: u64
) -> Result<CodecMessageFuture<D>>
```

Usage example:

```rust
let reply: SomeEvent = msg::send_for_reply_as(
    receiver_id,
    SomeAction {
        command: 42,
    },
    0,
    0,
)
.expect("Unable to send message")
.await
.expect("Error in receiving reply");
```
