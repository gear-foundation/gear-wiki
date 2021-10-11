---
sidebar_position: 1
sidebar_label: 'Оverview'
---

# Getting started in 5 minutes

In this article, we are going to write and deploy our first smart contract to a GEAR network of your choice.

## Prerequesites

First of all, we need to install all the tools required to build our first contract in Rust. 

We will use [Rustup](https://rustup.rs/) to get our Rust compiler ready.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

(Optional) For your convenience, it'd be best to create a dedicated directory for everything GEAR-related. 

```bash
mkdir ~/GEAR
cd ~/GEAR
```

The rest of the article will assume that you are using the paths suggested, so make sure you make adjustments according to your directory tree.

As we will be compiling our Rust smart contract to WASM, we will need a WASM compiler. Let's add it to the toolchain.

```bash
rustup target add wasm32-unknown-unknown
```

Now, it's time to get the source code for GEAR itself by cloning our public [github repo](https://github.com/gear-tech/gear).

```bash
git clone git@github.com:gear-tech/gear.git
```

## Creating your first GEAR smart contract
Let's create a `contracts` directory inside `GEAR` and `cd` to it.

```bash
mkdir ~/GEAR/contracts
cd ~/GEAR/contracts
```

The next step would be to build a Rust library for our contract.

```bash
cargo new first-gear-app --lib
```

Now, your `GEAR/contracts` directory tree should look like this:

```bash
└── first-gear-app
    ├── Cargo.toml
    └── src
        └── lib.rs
```

It's time to write some code. Open `first-gear-app` with your favorite editor, we will use `VS Code`.

```bash
code ~/GEAR/contracts/first-gear-app
```

We will need to configure `Cargo.toml` in order for our contract to be properly built.

```yaml
[package]
name = "first-gear-app"
version = "0.1.0"
authors = ["Your Name"]
edition = "2021"
license = "GPL-3.0"

[lib]
crate-type = ["cdylib"]

[dependencies]
gcore = { path = "~/GEAR/gcore", features = ["debug"] }
gstd = { path = "~/GEAR/gstd", features = ["debug"] }
```
:::caution

Make sure that you use the correct path for `gcore` and `gstd` in `Cargo.toml`.

Now, it's time to replace the default contents of `lib.rs` with the code for our first smart contract.

In order to do that, you should open `src/lib.rs` in your editor and paste the following code:

```rust
use gstd::{ext, msg};

#[no_mangle]
pub unsafe extern "C" fn handle() {
    let new_msg = String::from_utf8(msg::load_bytes()).expect("Invalid message: should be utf-8");

    if &new_msg == "PING" {
        msg::send(msg::source(), b"PONG", 10_000_000);
    }
}

#[no_mangle]
pub unsafe extern "C" fn init() {}
```

We will not dive into the specifics behind the smart contract implementation in this article. The only thing you need to know is that this contract responds to a `PING` message send to the contract with `PONG`. If you want to learn more about writing smart contracts for GEAR, refer to [this article on Smart Contracts](smart-contracts/gear-program.md).

Now, it's time to compile the contract.

```bash
cargo build --target wasm32-unknown-unknown --release
```

If everything goes well, your working directory should now have a `target` directory that looks like this:

## Deploy your Smart Contract to the TestNet