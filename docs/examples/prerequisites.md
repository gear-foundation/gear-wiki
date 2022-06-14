---
sidebar_label: Prerequisites
sidebar_position: 1
---

# Gear Examples

Gear provides a set of examples that can be used for your familiarization with writing programs on Gear or become the basis for your own dApp: [https://github.com/gear-dapps](https://github.com/gear-dapps).

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
  └── gear-app // Your contract dir
      │
      ├── src // Source files of your program
      │    ├── maybe_some_file.rs // Additional module if needed
      │    └── lib.rs // Main file of your program
      │
      └── Cargo.toml // Manifest of your program
```

Create file `build.rs` with the following code:

```rust
fn main() {
    gear_wasm_builder::build();
}
```

`Cargo.toml` is a project manifest in Rust, it contains all metadata necessary for compiling the project.
Configure the `Cargo.toml` similarly to how it is configured [ping/Cargo.toml](https://github.com/gear-dapps/ping/blob/master/Cargo.toml). You can refer to [Getting Started](getting-started-in-5-minutes.md) for additional details.

## Building Rust Contract

We should compile our smart contract in the app folder:

```bash
cargo build --release
```

Our application should compile successfully and the final file `target/wasm32-unknown-unknown/release/gear-app.wasm` should appear.
