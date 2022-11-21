---
sidebar_label: 数据序列化/反序列化
sidebar_position: 4
---

# 数据序列化/反序列化

为了优化数据在网络上的发送和接收方式，Gear 使用`parity-scale-codec`，这是 SCALE 编解码器的 Rust 实现。这个编解码器被 Substrate 节点的内部 runtime 所使用。SCALE 是一种轻量级的编码格式，能够实现数据的序列化和反序列化。使用 SCALE 对数据进行编码（和解码），它非常适用于资源受限的执行环境，如区块链运行时间和低功耗、低内存设备。

在程序中使用 SCALE codec，`Cargo.toml` 需要添加以下内容：

```toml
[dependencies]

// ...
codec = { package = "parity-scale-codec", version = "3.1.2", default-features = false }
```

```rust
use codec::{Decode, Encode};

#[derive(Encode, Decode)]
enum MyType {
    MyStruct { field: ... },
    ...
}
```

:::info

我们只需要在使用来自 `gstd` 的包装方法时使用 Encode 和 Decode 特性，例如 `msg::send`，`msg::reply`，`send_for_reply` 等。像 `send_byte` 或`reply_bytes` 这样的方法，我们操作的是字节数组，所以不需要进行解码/编码。

:::

更多的内容请看 [SCALE Codec](https://github.com/paritytech/parity-scale-codec)。

## `scale-info`

`scale-info` 是一个描述 Rust 类型的库，提供有关可编码 SCALE 类型结构的信息。这些被定义为第三方工具 (例如 UI 客户端) 提供了关于它们如何能够解码不受语言影响的类型的信息。Gear 程序使用 `scale-info` 的接口称为 `metadata` 宏。它为所有必要的入口点定义了传入和传出类型，并允许合约和客户端相互理解。

在合约中使用 `metadata`，`Cargo.toml` 需要添加以下内容：

```toml
[dependencies]

// ...
scale-info = { version = "2.2.0", default-features = false }
```

```rust
// We define all incoming and outgoing data types in advance

gstd::metadata! {
    title: "gear program",
    init:
        input: String,
    handle:
        input: MyAction,
        output: Vec<u8>,
    state:
        input: StateQuery,
        output: StateReply,
}
```

更多的内容请看 [scale-info](https://github.com/paritytech/scale-info)。
