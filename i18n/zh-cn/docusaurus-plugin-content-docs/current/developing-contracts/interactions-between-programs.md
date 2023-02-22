---
sidebar_label: 异步合约
sidebar_position: 6
---

# 异步合约

Gear 程序之间的异步交互与通常的异步请求类似，在使用`await`并通过发送消息来实现。

## 程序入口

如果一个程序使用异步信息，它的主要可执行函数就会改变。

### async_init()

如果在程序初始化中存在异步调用，那么我们应该使用 `async_init()` 而不是 `init()`。

```rust
#[gstd::async_init]
async fn init() {
    gstd::debug!("Hello world!");
}
```

### main()

对于异步信息也是如此，我们用 `main` 代替 `handle` 、`handle_reply`。

```rust
#[gstd::async_main]
async fn main() {
    gstd::debug!("Hello world!");
}
```

:::info
`async_init` 可以和 `async_main` 一起使用。但如果使用这个宏，就不能指定 `init` 和 `handle_reply` 函数。
:::

# 跨程序消息通讯

要向 Gear 程序发送消息，使用函数 `send_for_reply(program, payload, value)`，在这个函数中：

- program - 发送消息的程序的地址
- payload - 程序的消息
- value - 附在消息上的资金

```rust
  pub fn send_for_reply_as<E: Encode, D: Decode>(
    program: ActorId,
    payload: E,
    value: u128
) -> Result<CodecMessageFuture<D>>
```
