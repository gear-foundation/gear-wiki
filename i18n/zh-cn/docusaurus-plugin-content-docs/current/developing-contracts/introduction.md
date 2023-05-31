---
sidebar_label: 可执行函数
sidebar_position: 1
---

# 可执行函数

程序是 Gear 组件的主要单元。程序代码存储为不可变的 [Wasm](/docs/gear/technology/wasm) 二进制文件（blob）。
每个程序都有一个固定的内存，在消息处理之间持续存在（所谓的静态区域）。

## 基础结构

任何程序最多可以包含 3 个入口点，它们在程序生命周期中执行各种功能：`init()`、`handle()`、`handle_reply()`。
它们都是可选的，但任何程序都需要至少有一个方法：`init()` 或 `handle()`。

Gear 协议引入的另一个特殊系统入口点是 `handle_signal()`。如果有必要的通知（信号）与程序消息相关的某些事件已经发生，它允许系统与程序通信。

### init()

`init()`方法是可选的，在程序初始化时只被调用一次。并处理传入的 `init payload`，如果有的话。

```rust

#[no_mangle]
extern "C" fn init() {
    // execute this code during contract initialization
}

```

### handle()

`handle()`方法（同样可选）将在每次程序收到传入的消息时被调用。在这种情况下，`payload` 将被处理。

```rust

#[no_mangle]
extern "C" fn handle() {
    // execute this code during explicitly incoming message
}

```

### handle_reply()

在 Gear 程序中对信息的回复，使用`handle_reply`函数进行处理。

```rust

#[no_mangle]
extern "C" fn handle_reply() {
    // execute this code during handling reply on the previously sent message
}

```
