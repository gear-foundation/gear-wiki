---
sidebar_label: Prerequisites
sidebar_position: 1
---

# Gear Examples

Gear provides a set of examples that can be used for your familiarization with writing programs on Gear or become the basis for your own dApp: [https://github.com/gear-dapps](https://github.com/gear-dapps).

You can write your own smart contract or try to build from examples. Let's Rock!

## Requirements

To develop your first Rust smart-contract you would have to install some components.

:::warning Note
Windows users may encounter some problems related to the installation of Rust components and dependencies.
It is highly recommended to use Linux or macOS for compiling Gear node and smart-contracts. 
:::

- Linux users should generally install `GCC` and `Clang`, according to their distribution’s documentation. Also, one should install `binaryen` toolset that contains required `wasm-opt` tool.

    - For example, on Ubuntu use:
    ```bash
    sudo apt install -y clang build-essential binaryen cmake protobuf-compiler
    ```
    - On macOS, you can get a compiler toolset and `binaryen` by running:
    ```bash
    xcode-select --install
    brew install binaryen
    ```

- Install Rustup:

    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

- Add Wasm target to your toolchain:

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
Configure the `Cargo.toml` similarly to how it is configured [ping/Cargo.toml](https://github.com/gear-dapps/ping/blob/master/Cargo.toml). You can refer to [Getting Started](/docs/getting-started-in-5-minutes.md) for additional details.

## Building Rust Contract

We should compile our smart contract in the app folder:

```bash
cargo build --release
```

Our application should compile successfully and the final file `target/wasm32-unknown-unknown/release/gear-app.wasm` should appear.
