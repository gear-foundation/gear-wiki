---
sidebar_position: 2
---

# Gear 库

Gear Protocol 的库`gstd`为开发智能合约提供了所有必要和完善的功能和方法。

## 通过 prelude 导入相似的类型

`gstd`的默认 `prelude` 模块列出了 Rust 自动导入每个程序中的东西。它重新导入了默认的 `std` 模块和 traits。在 Rust 的 Gear 程序中，`std` 可以安全地替换为 `gstd`。

更多详细内容请看 https://docs.gear.rs/gstd/prelude/index.html

## 消息处理

Gear Protocol 允许用户和程序通过消息与其他用户和程序进行交互。消息可以包含在`payload`，它能够在消息执行期间处理。通过模块 `msg`，我们可以与消息交互：

```rust
use gstd::msg;
```

消息处理只能在定义的函数 `init()`、`handle()` 和 `hadle_reply()` 内进行。它们还定义了处理此类消息的上下文。

- 获取当前正在处理的消息的 `payload` 并对其进行解码：

```rust
#![no_std]
use gstd::{msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {
    let payload_string: String = msg::load().expect("Unable to decode `String`");
}
```

- 使用`payload`回复消息：

```rust
#![no_std]
use gstd::msg;

#[no_mangle]
extern "C" fn handle() {
    msg::reply("PONG", 0).expect("Unable to reply");
}
```

-  向用户发送消息：

```rust
#![no_std]
use gstd::{msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {
    // ...
    let id = msg::source();
    let message_string = "Hello there".to_string();
    msg::send(id, message_string, 0).expect("Unable to send message");
}
```

关于 `msg` 的更多用法，请看 https://docs.gear.rs/gstd/msg/index.html

## 执行信息

程序可以通过使用 `exec` 模块获取有关当前执行上下文的一些有用信息：

```rust
use gstd::exec;
```

- 在区块时间戳到达指定日期后发送回复消息：

```rust
#![no_std]
use gstd::{exec, msg};

#[no_mangle]
extern "C" fn handle() {
    // Timestamp is in milliseconds since the Unix epoch
    if exec::block_timestamp() >= 1672531200000 {
        msg::reply(b"Current block has been generated after January 01, 2023", 0)
            .expect("Unable to reply");
    }
}
```

- 获得一个程序的余额：

```rust
#![no_std]
use gstd::exec;

#[no_mangle]
extern "C" fn handle() {
    // Get self value balance in program
    let my_balance = exec::value_available();
}
```

关于 `syscalls` 的更多用法，请看 https://docs.gear.rs/gstd/exec/index.html

## 在合约内部进行调试

宏 `gstd::debug` 提供在程序执行期间调试合约的能力：

```rust
#![no_std]
use gstd::{debug, msg, prelude::*};

#[no_mangle]
extern "C" fn handle() {
    let payload_string: String = msg::load().expect("Unable to decode `String`");
    debug!("{:?} received message: ", payload_string);
}
```
