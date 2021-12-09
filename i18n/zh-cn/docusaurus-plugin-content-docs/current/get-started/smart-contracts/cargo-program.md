---
sidebar_label: cargo-program utility
sidebar_position: 5
---

# `cargo-program` utility

`cargo-program` 是 Rust 的 `cargo` 扩展程序，旨在简化 Gear 程序的开发。

GitHub repo: https://github.com/gear-tech/cargo-program

## Install

- _（推荐）_ 使用 cargo-program 的最新版本：

```
cargo install --git https://github.com/gear-tech/cargo-program.git
```

- 从 [crates.io](https://crates.io/crates/cargo-program) 获取稳定版：

```
cargo install cargo-program
```

## Usage

### 创建一个新的 Gear 程序

```
cargo program new my-program
```

### 创建一个新的异步 Gear 程序

```
cargo program new my-async-program --async
```

### 构建 Gear 程序

debug 模式：

```
cargo program build
```

发布模式：

```
cargo program build --release
```

你会发现在 `target/wasm32-unknown-unknown/release` 目录，有 3 个
WASM 文件：

- 带有`.wasm` 扩展名的主要编译程序
- 带有`.opt.wasm` 扩展名的优化程序
- 带有`.meta.wasm` 扩展名的元数据提供程序
