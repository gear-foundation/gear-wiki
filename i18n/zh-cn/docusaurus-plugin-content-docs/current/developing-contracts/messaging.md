---
sidebar_label: "消息格式"
sidebar_position: 3
---

# 消息格式

与每个程序的交互是通过信息传递进行的。

Gear 中的消息有共同的接口，参数如下：

```
source account,
target account,
payload,
gas_limit
value
```

`gas_limit` 是用户愿意花在处理信息上的 gas 数量。

`value` 是一个要转账到目标账户的值。在初始程序上传的特殊信息中，这个值将被发送到该程序新创建账户的余额中。

## 消息类型

对于该程序，有以下类型的消息：

- 从用户到程序
- 从程序到程序
- 从程序到用户
- 来自用户的特殊消息，用于将新程序上传到网络。 payload 必须包含程序本身的 Wasm 文件。 不得指定目标帐户 - 它将作为处理消息发布的一部分创建。

## Gas

Gear 节点在消息处理过程中收取 gas 费用。 gas 费用是线性的——每个分配的 64KB 内存页面需要 64000 gas，每个检测的 Wasm 指令需要 1000 gas。
在这种情况下，手续费最低的交易的消息可能会延迟，甚至永远不会进入处理队列。如果在达到限制之前处理了交易，则剩余的气体将返回到发送帐户。

## 消息处理模块

根据上下文，程序以不同的方式解释消息。 为了在 Gear 程序中处理消息，使用了专有的 `gstd` 标准库和 `::msg` 模块。 gstd 中 msg.rs 中描述了所有可用函数：

[github 链接](https://github.com/gear-tech/gear/blob/master/gstd/src/msg.rs)

```c
pub fn load<D: Decode>() -> Result<D, codec::Error> {
    D::decode(&mut load_bytes().as_ref())
}
```

加载字节。

```c
pub fn load_bytes() -> Vec<u8> {
    let mut result = vec![0u8; gcore::msg::size()];
    gcore::msg::load(&mut result[..]);
    result
}
```

回复消息并尝试使用 `codec` 解码为指定类型。 返回`MessageId`。

```c
pub fn reply<E: Encode>(payload: E, gas_limit: u64, value: u128) -> MessageId {
    reply_bytes(&payload.encode(), gas_limit, value)
}
```

回复消息，内容以字节形式存放在 `payload` 中。 返回`MessageId`。

```c
pub fn reply_bytes<T: AsRef<[u8]>>(payload: T, gas_limit: u64, value: u128) -> MessageId {
    gcore::msg::reply(payload.as_ref(), gas_limit, value).unwrap()
}
```

## 消息编解码

Gear 使用`parity-scale-codec`，这是 SCALE 编解码器的 Rust 实现。
SCALE 是一种轻量级的格式，允许编码（和解码），这使得它非常适用于资源受限的执行环境，如区块链运行时间和低功耗、低内存设备。

```c
#[derive(Encode, Decode)]
```

更多关于 SCALE 的内容请看 [SCALE Codec](https://substrate.dev/docs/en/knowledgebase/advanced/codec)。
