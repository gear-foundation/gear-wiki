---
sidebar_label: Program Testing
sidebar_position: 6
---

# How to test a program

Gear [`gtest`](https://github.com/gear-tech/gear/tree/master/gtest) library is the recommended option for the programs (smart contracts) logic testing. This article describes how to test programs using `gtest`.

## Basics

Gear uses the standard for Rust programs testing mechanism - test build mode from `cargo`.

In accordance to basic concepts and testing methods described in [Rustbook](https://doc.rust-lang.org/book/ch11-00-testing.html), tests can be organized in two main categories: **unit tests** and **integration tests**.

The **unit tests** enable testing of each unit of code in isolation from the rest of the code. It helps to quickly find where the code works as expected and where not. The unit tests should be placed in the `src` directory in each file with the code that they test.

Even when units of code work correctly, it is important to test if several parts of the library work together correctly as well. For **integration tests**, a separate `tests` directory is required at the top level of your project directory, next to `src`. You can make as many test files in this directory as you need, Cargo will compile each of the files as an individual crate.

## Building a program in test mode

First of all, make sure you have a compiled WASM file of the program you want to test. You can refer to [Getting Started](getting-started-in-5-minutes.md) for additional details.

1. Usually the following command is used for regular compilation of Gear smart contracts:

    ```bash
    cd ~/gear/contracts/first-gear-app/
    cargo build --release
    ```

    Nightly compiler is required if some unstable features have been used:

    ```bash
    cargo +nightly build --release
    ```

2. The minimal command for running tests is:

    ```bash
    cargo test
    ```

    Nightly compiler is required if your contract uses unstable Rust features, the compiler will ask you to enable `nightly` if necessary. Only if you are writing the tests as unit/integration tests, rather than providing a separate library containing only the tests.

    ```bash
    cargo +nightly test
    ```

    Build tests in release mode so they run faster:

    ```bash
    cargo test --release
    ```

## Import `gtest` lib

In order to use the `gtest` library, it must be imported into your `Cargo.toml` file in the `[dev-dependencies]` block in order to fetch and compile it for tests only

```toml
[package]
name = "first-gear-app"
version = "0.1.0"
authors = ["Your Name"]
edition = "2021"

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", features = ["debug"] }

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git" }

[dev-dependencies]
gtest = { git = "https://github.com/gear-tech/gear.git" }
```

## `gtest` capabilities

The example provided for [PING-PONG](/docs/examples/ping) program.

```rust
use gtest::{Log, Program, System};

#[test]
fn basics() {
    // Initialization of the common environment for running smart contacts.
    //
    // This emulates node's and chain behavior.
    //
    // By default, sets:
    // - current block equals 0
    // - current timestamp equals UNIX timestamp of your system.
    // - minimal message id equal 0x010000..
    // - minimal program id equal 0x010000..
    let sys = System::new();

    // You may control time in the system by spending blocks.
    //
    // It adds the amount of blocks passed as argument to the current block of the system.
    // Same for the timestamp. Note, that for now 1 block in Gear network is 1 sec duration.
    sys.spend_blocks(150);

    // Initialization of styled `env_logger` to print logs (only from `gwasm` by default) into stdout.
    //
    // To specify printed logs, set the env variable `RUST_LOG`:
    // `RUST_LOG="target_1=logging_level,target_2=logging_level" cargo test`
    //
    // Gear smart contracts use `gwasm` target with `debug` logging level
    sys.init_logger();

    // Initialization of program structure from file.
    //
    // Takes as arguments reference to the related `System` and the path to wasm binary relatively
    // the root of the crate where the test was written.
    //
    // Sets free program id from the related `System` to this program. For this case it equals 0x010000..
    // Next program initialized without id specification will have id 0x020000.. and so on.
    let ping_pong = Program::from_file(
        &sys,
        "./target/wasm32-unknown-unknown/release/demo_ping.wasm",
    );

    // Also, you may use `Program::current()` function to load the current program.
    let ping_pong = Program::current(&sys);

    // We can check the id of the program by calling `id()` function.
    //
    // It returns `ProgramId` type value.
    let ping_pong_id = ping_pong.id();

    // There is also a `from_file_with_id` constructor to manually specify the id of the program.
    //
    // Every place in this lib, where you need to specify some ids,
    // it requires generic type `ID`, which implements `Into<ProgramIdWrapper>`.
    //
    // `ProgramIdWrapper` may be built from:
    // - u64;
    // - [u8; 32];
    // - String;
    // - &str;
    // - ProgramId (from `gear_core` one's, not from `gstd`).
    //
    // String implementation means the input as hex (with or without "0x")

    // Numeric
    let _ = Program::from_file_with_id(
        &sys,
        105,
        "./target/wasm32-unknown-unknown/release/demo_ping.wasm",
    );

    // Hex with "0x"
    let _ = Program::from_file_with_id(
        &sys,
        "0xe659a7a1628cdd93febc04a4e0646ea20e9f5f0ce097d9a05290d4a9e054df4e",
        "./target/wasm32-unknown-unknown/release/demo_ping.wasm",
    );

    // Hex without "0x"
    let _ = Program::from_file_with_id(
        &sys,
        "e659a7a1628cdd93febc04a4e0646ea20e9f5f0ce097d9a05290d4a9e054df5e",
        "./target/wasm32-unknown-unknown/release/demo_ping.wasm",
    );

    // Array [u8; 32] (e.g. filled with 5)
    let _ = Program::from_file_with_id(
        &sys,
        [5; 32],
        "./target/wasm32-unknown-unknown/release/demo_ping.wasm",
    );

    // If you initialize program not in this scope, in cycle, in other conditions,
    // where you didn't save the structure, you may get the object from the system by id.
    let _ = sys.get_program(105);

    // To send message to the program need to call one of two program's functions:
    // `send()` or `send_bytes()`.
    //
    // Both of the methods require sender id as the first argument and the payload as second.
    //
    // The difference between them is pretty simple and similar to `gstd` functions
    // `msg::send()` and `msg::send_bytes()`.
    //
    // The first one requires payload to be CODEC Encodable, while the second requires payload
    // implement `AsRef<[u8]>`, that means to be able to represent as bytes.
    //
    // `send()` uses `send_bytes()` under the hood with bytes from payload.encode().
    //
    // First message to the initialized program structure is always the init message.
    let res = ping_pong.send_bytes(100001, "INIT MESSAGE");

    // Any sending functions in the lib returns `RunResult` structure.
    //
    // It contains the final result of the processing message and others,
    // which were created during the execution.
    //
    // It has 4 main functions.

    // Returns the reference to the Vec produced to users messages.
    // You may assert them as you wish, iterating through them.
    assert!(res.log().is_empty());

    // Returns bool which shows that there was panic during the execution
    // of the main message.
    assert!(!res.main_failed());

    // Returns bool which shows that there was panic during the execution
    // of the created messages during the main execution.
    //
    // Equals false if no others were called.
    assert!(!res.others_failed());

    // Returns bool which shows that logs contains a given log.
    //
    // Syntax sugar around `res.log().iter().any(|v| v == arg)`.
    assert!(!res.contains(&Log::builder()));

    // To build a log for assertion you need to use `Log` structure with it's builders.
    // All fields here are optional.
    // Assertion with Logs from core are made on the Some(..) fields
    // You will run into panic if you try to set the already specified field.
    //
    // Constructor for success log.
    let _ = Log::builder();

    // Constructor for error reply log.
    //
    // Note that error reply never contains payload.
    // And it's exit code equals 1, instead of 0 for success replies.
    let _ = Log::error_builder();

    // Let’s send a new message after the program has been initialized.
    let res = ping_pong.send_bytes(100001, "PING");

    // Other fields are set optionally by `dest()`, `source()`, `payload()`, `payload_bytes()`.
    //
    // The logic for `payload()` and `payload_bytes()` is the same as for `send()` and `send_bytes()`.
    // First requires an encodable struct. The second requires bytes.
    let log = Log::builder()
        .source(ping_pong_id)
        .dest(100001)
        .payload_bytes("PONG");

    assert!(res.contains(&log));

    let wrong_log = Log::builder().source(100001);

    assert!(!res.contains(&wrong_log));

    // Log also has `From` implementations from (ID, T) and from (ID, ID, T),
    // where ID: Into<ProgramIdWrapper>, T: AsRef<[u8]>
    let x = Log::builder().dest(5).payload_bytes("A");
    let x_from: Log = (5, "A").into();

    assert_eq!(x, x_from);

    let y = Log::builder().dest(5).source(15).payload_bytes("A");
    let y_from: Log = (15, 5, "A").into();

    assert_eq!(y, y_from);

    assert!(!res.contains(&(ping_pong_id, ping_pong_id, "PONG")));
    assert!(res.contains(&(1, 100001, "PONG")));
}
```
