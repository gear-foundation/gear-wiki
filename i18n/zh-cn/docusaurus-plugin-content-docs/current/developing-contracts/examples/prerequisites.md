---
sidebar_label: '前期准备'
sidebar_position: 1
---

# Gear 范例

Gear 提供了一组例子，可以用来熟悉在 Gear 上编写程序，或者成为你自己的 dApp 的基础: [https://github.com/gear-tech/apps](https://github.com/gear-tech/apps).

你可以编写自己的智能合约或尝试从示例构建。 让我们开干吧！

## 要求

要开发你的第一个 Rust 智能合约，你必须:

- 安装 Rustup:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

- 添加 `wasm target` 到你的 `toolchain`:

```bash
rustup target add wasm32-unknown-unknown
```

## 首先

安装 `npm` 和 `node` 10. x 及以上版本。 

使用 **cargo** 来创建咱们的项目:

```bash
cargo new gear-app --lib
```

项目目录如下:

    gear-app/
      ---Cargo.toml
      ---src
      ------lib.rs

`Cargo.toml` 是 Rust 项目的 `manifest`, 它包含了所有编译项目所需的元数据。按照 [examples/ping/Cargo.toml](https://github.com/gear-tech/gear/blob/master/examples/ping/Cargo.toml) 来配置 `Cargo.toml`；

## 编译 Rust 合约

咱们使用以下命令在 `app` 目录编译智能合约：

```bash
cargo +nightly build --target wasm32-unknown-unknown --release
```

咱们的应用编译完成后，将生成最终文件 `target/wasm32-unknown-unknown/release/gear-app.wasm`。