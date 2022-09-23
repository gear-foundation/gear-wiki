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
#[derive(Encode, Decode)]
enum MyType {
    MyStruct { field: ... },
    ...
}
```

[Learn more about SCALE Codec](https://github.com/paritytech/parity-scale-codec)

## scale-info

A library to describe Rust types, geared towards providing info about the structure of SCALE encodable types.

The definitions provide third party tools (e.g. a UI client) with information about how they are able to decode types agnostic of language.

```toml
[dependencies]

// ...
scale-info = { version = "2.2.0", default-features = false, features = ["derive"] }
```

[Learn more about scale-info](https://github.com/paritytech/scale-info)