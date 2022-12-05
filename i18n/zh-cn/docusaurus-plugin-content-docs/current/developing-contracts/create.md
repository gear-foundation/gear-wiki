---
sidebar_label: 创建合约
sidebar_position: 5
---

# 通过合约创建合约

一个去中心化应用程序的业务逻辑可能需要程序（智能合约）有可能在网络中创建、初始化和启动一个或几个其他程序。当外部各方（用户）需要访问他们自己的典型智能合约的实例时，通过合约创建合约的需求是必要的。

我们以一个贷款功能的合约为例。在这种情况下，开发者可以创建一个工厂合约，该合约将按需创建贷款智能合约的实例并进行操作。

首先，要创建一个程序，必须使用 `gear.uploadCode` 将程序代码提交到网络并获取其代码哈希值。提交程序代码不会初始化程序。

:::info
你可以通过 [Gear IDEA](https://idea.gear-tech.io/) 提交合约代码，也可以通过 `@gear-js/api` SDK 提交。
甚至也可以通过 `Gear Program` 命令行提交 —— https://github.com/gear-tech/gear-program 。
:::

代码提交后，可以用来创建一个新的合约：

```rust
use gstd::{prog::ProgramGenerator, CodeHash, msg};

#[no_mangle]
extern "C" fn handle() {
    let submitted_code: CodeHash =
        hex_literal::hex!("abf3746e72a6e8740bd9e12b879fbdd59e052cb390f116454e9116c22021ae4a")
            .into();

    // ProgramGenerator returs ProgramId

    let program_id =  ProgramGenerator::create_program_with_gas(submitted_code, b"payload", 10_000_000_000, 0).unwrap();

    msg::send(program_id, b"hello", 0).expect("Unable to send message");

}
```

更多 `gstd::prog` 相关的内容，请看 https://docs.gear.rs/gstd/prog/index.html
