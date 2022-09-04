---
sidebar_label: 消息格式
sidebar_position: 3
---

# 消息格式

与每个程序的交互是通过信息传递进行的。

Gear 中的消息有共同的接口，参数如下：

- Source account
- Target account
- Payload
- Gas limit
- Value

_Gas limit_ 是用户愿意花在处理信息上的 gas 数量。

_Value_ 是要转账到目标账户的值。在初始程序上传的特殊信息中，这个值将被发送到该程序新创建账户的余额中。

## 消息类型

对于该程序，有以下类型的消息：

- 从用户到程序
- 从程序到程序
- 从程序到用户
- 来自用户的特殊消息，用于将新程序上传到网络。payload 必须包含程序本身的 WASM 文件。不得指定目标帐户 - 它将作为处理消息发布的一部分创建。

## Gas

Gas 是一种用于支付区块链计算的特殊货币。它的形成是通过交换具有特殊系数的价值（目前=1，但如果网络投票，这在未来可能会改变）。Gas 与 weight 的关系是基于一对一的比率。一个单位的 weight 就是一皮秒的计算量。为了让区块适应特定的执行时间，我们计算其可用于支出的 gas 余量，但不会超过它。

基于一个单位的 weight 等于一个单位的气体，这需要一皮秒的计算，我们使用平均硬件上的基准来确定所有可用的 wasm 指令的成本，包括系统调用。

## 消息处理模块

根据不同的上下文，程序对消息的解释是不同的。为了在 Gear 程序中处理消息，特意使用了`gstd`标准库中的`msg`模块。这里描述了所有可用的功能：https://docs.gear.rs/gstd/msg/index.html

## 理解消息编解码接口

Gear 使用`parity-scale-codec`，这是 SCALE 编解码器的 Rust 实现。
SCALE 是一种轻量级的格式，允许编码、解码，这使得它非常适用于资源受限的执行环境，如区块链运行时间和低功耗、低内存设备。

```rust
#[derive(Encode, Decode)]
enum MyType {
    MyStruct { field: ... },
    ...
}
```

关于 SCALE 更多的内容请看 [SCALE Codec](https://substrate.dev/docs/en/knowledgebase/advanced/codec)。
