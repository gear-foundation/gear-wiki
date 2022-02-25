---
sidebar_label: "Program State"
sidebar_position: 2
---

# Gear program state

This article will look at creating a simple decentralized application in Rust language for the Gear blockchain.

Using the voting app example, We will study the structure of Gear start contracts, learn how to work with the actor model architecture of programs, process messages, and work with the state.

This article is intended to demonstrate the simplicity and convenience of creating applications on the Gear Platform.

## Let's start with Rust

Rust is a multi-paradigm programming language that's focused on safety and performance. It was built with speed and efficiency in mind, providing zero-cost abstractions and functional features. For many developers, it solves the common problems with other low-level languages like C and C++.

[Find out why Gear uses Rust](https://medium.com/@gear_techs/why-does-gear-use-rust-732c79b583bf)

Also, Rust has a significant advantage. The code in Rust can be compiled in WebAssembly. 

Well, let's start installing Rust on your computer. In this article, I am using MacOs Monterey 12.1

To begin with, open your favorite terminal and run the installer:

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

And let's install toolchains to compile the code in WebAssembly:

```sh
rustup toolchain add nightly
rustup target add wasm32-unknown-unknown --toolchain nightly
cargo install --git https://github.com/gear-tech/gear wasm-proc
```

Everything is ready for the first application!

## Time to create the first Rust program

Let's create our voting-app project with the help of the cargo command:

```sh
cargo new voting-app --lib
```

Take look at project structure:

```
voting-app/
├── Cargo.toml
└── src
_____└── lib.rs
```

Cargo.toml is a project manifest in Rust. It contains the metadata necessary for compiling the project. Add the necessary dependencies:

```
[package]
name = "voting-app"
version = "0.1.0"
authors = ["Gear Technologies"]
edition = "2018"
license = "GPL-3.0"

[lib]
crate-type = ["cdylib"]

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear", features = ["debug"] }
scale-info = { version = "1.0.0", default-features = false, features = ["derive"] }
codec = { package = "parity-scale-codec", version = "2.0.0", default-features = false, features = ["derive"] }
primitive-types = { version = "0.10.1", default-features = false, features = ["scale-info"]}


[profile.release]
lto = true
opt-level = 's'
```

Open the src/lib.rs file, and at the beginning of the file, we will write the required imports of the Gear library. And also, take a look at the [basic structure of the program](https://wiki.gear-tech.io/developing-contracts/gear-program):

```rust
#![feature(const_btree_new)]
#![no_std]

// External packages (crates) and internal modules import
use codec::{Decode, Encode};
use gstd::{debug, msg, prelude::*};
use scale_info::TypeInfo;
```

```rust
// Init function that is executed once upon contract initialization
// Here is empty
#[no_mangle]
pub unsafe extern "C" fn init() {}

// Handle function that processes the incoming message
#[no_mangle]
pub unsafe extern "C" fn handle() {}
```

It is the minimum necessary structure for our application to work. The init() function is executed once during the context initialization and can perform any actions once. The handle function is responsible for processing all incoming messages handled by our program.

Next, we will add a Voting structure that will contain our main code for working with the program state.

```rust
#[derive(Clone)]
pub struct State {
    votes_received: BTreeMap<String, i32>,
}

impl State {
    // Create a state
    pub const fn new() -> Self {
        Self {
            votes_received: BTreeMap::new(),
        }
    }

    // Add new candidate
    pub fn add_candidate(&mut self, candidate: String) {
        self.votes_received.insert(candidate, 0);
    }

    // Vote for the candidate by name. If candidate no exist add it
    pub fn vote_for_candidate(&mut self, name: String) {
        let counter = self.votes_received.entry(name).or_insert(0);
        *counter += 1;
    }
}

// The state itself (i.e. the variable state will be accessed through)
static mut STATE: State = State::new();
```

We will also need to define the metadata structure for implementing the input/output communication interface. The method described is a binary map for mutual interaction between different programming languages. For example, since the program is compiled into WASM format, it only understands the byte language. To simplify the operation, we define data structures in advance for further encoding and decoding. For this, we use a special macro gstd::metadata!:

```rust
gstd::metadata! {
   title: "Voting App",
   handle:
       input: Action,
   state:
       input: StateAction,
       output: StateReply,
}
```

Now let's start processing incoming messages. Every time our contract receives an incoming message, we will process it accordingly. Let's describe the handle() function:

```rust
#[derive(Debug, TypeInfo, Encode)]
pub enum StateReply {
   All(BTreeMap<String, i32>),
   VotesFor(i32),
}
 
#[derive(Debug, TypeInfo, Decode)]
pub enum StateAction {
   All,
   VotesFor(String),
}

// Handle function that processes the incoming message
#[no_mangle]
pub unsafe extern "C" fn handle() {
    let action: Action = msg::load().unwrap();

    debug!("Received action: {:?}", action);

    match action {
        Action::AddCandidate(name) => {
            STATE.add_candidate(name.clone());

            msg::reply((), 0, 0);

            debug!("Added new candidate: {:?}", name);
        }

        Action::VoteForCandidate(name) => {
            STATE.vote_for_candidate(name.clone());

            msg::reply((), 0, 0);

            debug!("Voted for: {:?}", name);
        }
    }
}
```

Now we can communicate with our program. Add and vote for candidates. It remains to teach our program to show all candidates or votes for a certain one by name. To do this, we will use the meta_state() function, which will return the state immediately and without any cost.

```rust
// The function that returns a part of memory with a state
#[no_mangle]
pub unsafe extern "C" fn meta_state() -> *mut [i32; 2] {
   let query: StateAction = msg::load().expect("failed to decode input argument");
 
   let encoded = match query {
       StateAction::All => StateReply::All(STATE.votes_received.clone()).encode(),
 
       StateAction::VotesFor(name) => {
           let votes_for_candidate = STATE
               .votes_received
               .get(&name)
               .expect("Can't find any candidate");
 
           StateReply::VotesFor(votes_for_candidate.clone()).encode()
       }
   };
 
   let result = gstd::macros::util::to_wasm_ptr(&encoded[..]);
   core::mem::forget(encoded);
 
   result
}
```

Source: [https://github.com/gear-tech/VotingApp](https://github.com/gear-tech/VotingApp)

## Build Gear programs

Our smart contract is ready! Now it needs to be compiled and uploaded to the Gear blockchain. Let's get started!

Being in the voting-app folder, we compile our smart contract:

```sh
RUSTFLAGS="-C link-args=--import-memory" cargo +nightly build --release --target=wasm32-unknown-unknown
wasm-proc --path ./target/wasm32-unknown-unknown/release/voting_app.wasm
```

Our application should compile successfully and the final files target/`wasm32-unknown-unknown/release/voting-app.opt.wasm` and `target/wasm32-unknown-unknown/release/voting-app.meta.wasm` should appear. (meta.wasm is a binary interface for interacting with program on javascript part)


## Using

### 📦 Install Polkadot.js Extension
Download and install Polkadot.js browser extension: [https://polkadot.js.org/extension/](https://idea.gear-tech.io/)

### 👛 Create Account

Create a new account using Polkadot.js extension. Don't forget to save the mnemonic seed phrase and password in a safe place.

### ✉️ Upload the Program

- Go to [https://idea.gear-tech.io/](https://idea.gear-tech.io/)
- Connect to your account using the Connect button. Allow website access to your wallet in Polkadot.js extension.
- Top up your test account using the Get test account button. This button can be pressed several times.
- Upload the program (.opt.wasm) and metadata (.meta.wasm) giving some meaningful name to the program and setting the gas limit to 100'000'000. Sign the transaction using Polkadot.js extension.
- Find the program in Recently uploaded programs section and copy its address.

### 📒 Add new Candidate/Vote for Candidate

- Find your program in the All programs section and open the message sending form.
- Add a new candidate or vote for an existing one.
- Set the Gas limit to 300'000'000 and click Send request. Sign the transaction using Polkadot.js extension.

### 📒 Read State

- In program page go to Read state
- Provide candidate name as String to get the number of votes for it, or let input empty to receive all existing candidates.


In the next article, we will learn how to write tests for Gear smart contracts using gtest library