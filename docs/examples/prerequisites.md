---
sidebar_label: 'Prerequisites'
sidebar_position: 1
---

# Gear Examples

Gear provides a set of examples that can be used for your familiarization with writing programs on Gear or become the basis for your own dApp: [https://github.com/gear-tech/apps](https://github.com/gear-tech/apps).

You can write your own smart contract or try to build from examples. Let's Rock!

## Requirements

To develop your first Rust smart-contract you would have to:

- Install Rustup:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

- Add wasm target to your toolchain:

```bash
rustup toolchain add nightly
rustup target add wasm32-unknown-unknown --toolchain nightly
```

## First steps

To create our app project use the command **cargo**:

```bash
cargo new gear-app --lib
```

The project structure is following:

```
  └── gear-app // YOUR CONTRACT DIR
    │
    ├── src // SOURCE FILES OF YOUR CONTRACT
    │    ├── maybe_some_file.rs // SOME NEEDED FILE FOR YOUR LOGIC
    │    └── lib.rs // MAIN FILE OF YOUR CONTRACT
    │
    └── Cargo.toml // MANIFEST OF YOUR CONTRACT
```

`Cargo.toml` is a project manifest in Rust, it contains all metadata necessary for compiling the project.
Configure the `Cargo.toml` similarly to how it is configured [examples/ping/Cargo.toml](https://github.com/gear-tech/gear/blob/master/examples/ping/Cargo.toml);

## Building Rust Contract

We should compile our smart contract in the app folder:

```bash
RUSTFLAGS="-C link-args=--import-memory" cargo +nightly build --release --target=wasm32-unknown-unknown
```

Our application should compile successfully and the final file `target/wasm32-unknown-unknown/release/gear-app.wasm` should appear.
