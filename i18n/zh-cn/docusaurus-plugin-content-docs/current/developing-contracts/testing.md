---
sidebar_label: 合约测试
sidebar_position: 12
---

# 如何测试一个程序

Gear [`gtest`](https://github.com/gear-tech/gear/tree/master/gtest) 库是程序（智能合约）逻辑测试的推荐选项。这篇文章介绍如何使用`gtest`来测试程序。

## 基础信息

Gear 使用了来自 `cargo` 构建的 Rust 程序标准测试机制。

根据 [Rustbook](https://doc.rust-lang.org/book/ch11-00-testing.html) 中描述的基本概念和测试方法，测试可以被组织成两个主要类别：**单元测试**和**集成测试**。

**单元测试**能够对每个单元的代码进行测试，并与其他代码隔离。它可以帮助快速找到代码在哪些地方按照预期工作，哪些地方没有。单元测试应该放在`src`目录下，与它们所测试的代码一起放在一个文件中。

即使单元代码工作正常，对代码库的几个部分是否也能一起正常工作进行测试也很重要。对于**集成测试**，需要在项目目录的顶层，即`src'旁边建立一个单独的测试目录。你可以在这个目录下添加任意多的测试文件，Cargo 会把每个文件作为一个单独的 crate 来编译。

## 在测试模式下构建程序

首先，确保你想测试的程序已经编译成 `Wasm` 文件。你可以参考 [5 分钟入门教程](getting-started-in-5-minutes.md) 了解更多细节。

1. 通常情况下，以下命令用于 Gear 智能合约的常规编译：

    ```bash
    cd ~/gear/contracts/first-gear-app/
    cargo build --release
    ```

    如果使用了一些不稳定的特性，则需要 Nightly 编译器：

    ```bash
    cargo +nightly build --release
    ```

2. 运行测试的最简命令是：

    ```bash
    cargo test
    ```

    如果你的合约使用不稳定的 Rust 特性，就需要 Nightly 编译器，编译器会要求你在必要时启用`nightly`。
    仅当将测试写为单元/集成测试，而不是提供仅包含测试的单独库时。

    ```bash
    cargo +nightly test
    ```

    在 release 模式下构建测试，使其运行更快：

    ```bash
    cargo test --release
    ```

## 引入 `gtest` 库

为了使用 `gtest` 库，它必须被导入 `Cargo.toml` 文件的 `[dev-dependencies]` 中，以便只在测试时获取和编译。

```toml
[package]
name = "first-gear-app"
version = "0.1.0"
authors = ["Your Name"]
edition = "2021"

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.0.2" }

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", tag = "v1.0.2" }

[dev-dependencies]
gtest = { git = "https://github.com/gear-tech/gear.git", tag = "v1.0.2" }
```

## `gtest` 的能力

为 [PING-PONG](/docs/examples/ping) 程序提供的测试例子。

```rust
use gtest::{Log, Program, System};

#[test]
fn basics() {
    // Initialization of the common environment for running smart contracts.
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
