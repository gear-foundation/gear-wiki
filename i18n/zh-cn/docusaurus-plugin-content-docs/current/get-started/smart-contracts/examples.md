---
sidebar_label: 'Examples'
sidebar_position: 4
---

# Gear 范例

你可以编写自己的智能合约，或者尝试通过例子中建立合约。摇滚起来吧！

## 要求

要开发你的第一个 Rust 智能合约，你需要：

- Install Rustup:
- 安装 Rustup：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

- 为工具链添加 wasm target：

```bash
rustup target add wasm32-unknown-unknown
```

## 第一步

安装 `npm` 和 `node`， `node` 版本至少是 10.x 。

通过 **cargo** 命令创建项目：

```bash
cargo new gear-app --lib
```

项目结构如下所示：

    gear-app/
      ---Cargo.toml
      ---src
      ------lib.rs

`Cargo.toml`是 Rust 的项目清单，它包含编译项目所需的所有元数据。

配置`Cargo.toml`，与配置[examples/ping/Cargo.toml](https://github.com/gear-tech/gear/blob/master/examples/ping/Cargo.toml)的方式类似。

## PING-PONG

Gear 是非常容易编写代码的!

下面是一个经典的 ping-pong 合约的最小程序：

```rust
use gstd::{ext, msg};

#[no_mangle]
pub unsafe extern "C" fn handle() {
    let new_msg = String::from_utf8(msg::load()).expect("Invalid message: should be utf-8");

    if &new_msg == "PING" {
        msg::send(msg::source(), b"PONG", 10_000_000);
    }
}

#[no_mangle]
pub unsafe extern "C" fn init() {}
```

它将 `PONG` 信息发送给原发送人（可以是你！）。

## 编译 Rust 合约

我们应该在 app 文件夹中编译智能合约：

```bash
cargo build --target wasm32-unknown-unknown --release
```

我们的应用程序应该编译成功了，最后会出现文件 `target/wasm32-unknown-unknown/release/gear-app.wasm`。
