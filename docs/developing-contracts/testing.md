---
sidebar_label: Program Testing
sidebar_position: 14
---

# How to test a Gear program

## Basics

Gear uses the standard testing mechanism for Rust programs: build and run testing executables using `cargo`.

Following basic concepts and testing methods described in [Rustbook](https://doc.rust-lang.org/book/ch11-00-testing.html), you can organize tests in two main categories: **unit tests** and **integration** tests.

The **unit tests** enable testing of each unit of code in isolation from the rest of the code. It helps to quickly find where the code works as expected and where it does not. One should place unit tests in the `src` directory in each file with the code they test.

Even when code units work correctly, it is crucial to test if several library parts work together correctly. For **integration tests**, a separate `tests` directory is required at the top level of your project directory, next to `src`. You can make as many test files in this directory as you need. `cargo` will compile each file as an individual crate.

# How to test a program

There are at least two ways how to test and debug Gear programs.

The first is the off-chain testing using a low-level [`gtest`](https://docs.gear.rs/gtest/) crate. This approach is recommended for unit and integration tests.

The second is the on-chain testing with a higher level [`gclient`](https://docs.gear.rs/gclient/) crate. It perfectly fits the needs of end-to-end testing.

Although `gclient` is oriented towards end-to-end testing, tests can be written as unit or integration tests in terms of Rust. It is recommended to use the integration-like approach with separate test files in the `tests` directory when utilizing the `gclient` crate.

## Building a program in test mode

First, be sure you have a compiled Wasm file of the program you want to test. You can refer to [Getting Started](getting-started-in-5-minutes.md) for additional details.

1. Usually, the following command is used for the regular compilation of Gear programs:

    ```bash
    cd ~/gear/contracts/first-gear-app/
    cargo build --release
    ```

    The nightly compiler is required if some unstable features have been used:

    ```bash
    cargo +nightly build --release
    ```

2. The minimal command for running tests is:

    ```bash
    cargo test
    ```

    The nightly compiler is required if your program uses unstable Rust features, and the compiler will ask you to enable `nightly` if necessary.

    ```bash
    cargo +nightly test
    ```

    Build tests in release mode, so they run faster:

    ```bash
    cargo test --release
    ```

## Dig deeper

The following two sections outline testing the Gear program using both the `gtest` and `gclient` crates.
