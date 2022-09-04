---
sidebar_label: "程序状态"
sidebar_position: 2
---

# Gear 程序状态

程序是 Gear 组件的主要单元。程序代码存储为不可变的 Wasm 二进制文件（blob）。
每个程序都有一个固定的内存，在消息处理之间持续存在（所谓的静态区域）。

Gear 程序的最基本结构是这样的：

```c
#![no_std]

use gstd::msg;

#[no_mangle]
pub unsafe extern "C" fn handle() {
    msg::reply(b"Hello world!", 0).expect("Error in sending reply");
}

#[no_mangle]
pub unsafe extern "C" fn init() {}

```

可选的`init()`函数在程序初始化时只被调用一次。并处理传入的 `init payload`，如果有的话。

同样可选的`handle()`函数将在每次程序收到传入的消息时被调用。在这种情况下，`payload` 将被处理。
