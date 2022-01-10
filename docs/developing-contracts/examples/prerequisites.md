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
rustup target add wasm32-unknown-unknown
```

## First steps

At least 10. x `npm` and `node` versions must be installed

To create our app project use the command **cargo**:

```bash
cargo new gear-app --lib
```

The project structure is following:

    gear-app/
      ---Cargo.toml
      ---src
      ------lib.rs

`Cargo.toml` is a project manifest in Rust, it contains all metadata necessary for compiling the project.
Configure the `Cargo.toml` similarly to how it is configured [examples/ping/Cargo.toml](https://github.com/gear-tech/gear/blob/master/examples/ping/Cargo.toml);

## Building Rust Contract

We should compile our smart contract in the app folder:

```bash
cargo +nightly build --target wasm32-unknown-unknown --release
```

Our application should compile successfully and the final file `target/wasm32-unknown-unknown/release/gear-app.wasm` should appear.
