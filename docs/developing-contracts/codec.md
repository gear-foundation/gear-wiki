---
sidebar_label: Encode/Decode data
sidebar_position: 4
---

# Encode/Decode data

Gear uses the `parity-scale-codec`, a Rust implementation of the SCALE Codec. SCALE is a lightweight format that allows encoding/decoding which makes it highly suitable for resource-constrained execution environments like blockchain runtimes and low-power/low-memory devices.

To use scale codec in your program, you should add it in `Cargo.toml`:

```toml
[dependencies]

// ...
codec = { package = "parity-scale-codec", version = "3.1.2", default-features = false, features = ["derive", "full"] }
```

```rust
use codec::{Decode, Encode};

#[derive(Encode, Decode)]
enum MyType {
    MyStruct { field: ... },
    ...
}
```

:::info
Encode and Decode trait we need only in the case of using wrapped methods from gstd such `msg::send`, `msg::reply`, `send_for_reply` etc. In methods such as `send_byte` or `reply_bytes`, we operate with a set of bytes, then nothing needs to be decoded/encoded.
:::


[Learn more about SCALE Codec](https://github.com/paritytech/parity-scale-codec)

## scale-info

A library to describe Rust types, geared towards providing info about the structure of SCALE encodable types.

The definitions provide third party tools (e.g. a UI client) with information about how they are able to decode types agnostic of language. Such an interface that `scala-info` uses for Gear programs is the `metadata` macro. It defines incoming and outgoing types for all necessary entry points and allows contracts and the client part to understand each other.

To use metadata in contract:

```toml
[dependencies]

// ...
scale-info = { version = "2.2.0", default-features = false, features = ["derive"] }
```

```
// We define all incoming and outgoing data types in advance

gstd::metadata! {
    title: "gear program",
    init:
        input: String,
    handle:
        input: MyAction,
        output: Vec<u8>,
    state:
        input: StateQuery,
        output: StateReply,
}
```

[Learn more about scale-info](https://github.com/paritytech/scale-info)