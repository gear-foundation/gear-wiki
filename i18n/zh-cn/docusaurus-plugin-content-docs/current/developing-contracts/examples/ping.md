---
sidebar_label: 'PING-PONG'
sidebar_position: 2
---

# PING-PONG

使用 Gear 写代码很容易！

这是一个经典的 Ping-pong 合约小程序:

```rust
    #![no_std]

    use gstd::{debug, msg, prelude::*};

    static mut MESSAGE_LOG: Vec<String> = vec![];

    #[no_mangle]
    pub unsafe extern "C" fn handle() {
        let new_msg = String::from_utf8(msg::load_bytes()).expect("Invalid message");

        if new_msg == "PING" {
            msg::reply_bytes("PONG", 12_000_000, 0);
        }

        MESSAGE_LOG.push(new_msg);

        debug!("{:?} total message(s) stored: ", MESSAGE_LOG.len());

        for log in MESSAGE_LOG.iter() {
            debug!(log);
        }
    }

    #[no_mangle]
    pub unsafe extern "C" fn init() {}
```

它只会将`PONG`发送回原始发送者(可以是你!)

GitHub 链接: https://github.com/gear-tech/apps/tree/master/ping