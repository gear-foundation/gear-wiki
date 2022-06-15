---
sidebar_label: 'PING-PONG'
sidebar_position: 2
---

# PING-PONG

使用 Gear 写代码很容易！

这是一个经典的 Ping-pong 合约小程序：

```rust
#![no_std]

use gstd::{debug, msg, prelude::*};

static mut MESSAGE_LOG: Vec<String> = vec![];

#[no_mangle]
pub unsafe extern "C" fn handle() {
    let new_msg = String::from_utf8(msg::load_bytes()).expect("Invalid message");

    if new_msg == "PING" {
        msg::reply_bytes("PONG", 0).unwrap();
    }

    MESSAGE_LOG.push(new_msg);

    debug!("{:?} total message(s) stored: ", MESSAGE_LOG.len());

    for log in MESSAGE_LOG.iter() {
        debug!(log);
    }
}

/// and a simple unit test:

#[cfg(test)]
mod tests {
    extern crate std;

    use gtest::{Log, Program, System};

    #[test]
    fn it_works() {
        let system = System::new();
        system.init_logger();

        let program = Program::current(&system);

        let res = program.send_bytes(42, "INIT");
        assert!(res.log().is_empty());

        let res = program.send_bytes(42, "PING");
        let log = Log::builder().source(1).dest(42).payload_bytes("PONG");
        assert!(res.contains(&log));
    }
}
```

该程序只是将 `PONG` 发回向它发送 `PING`的原始发送者。

GitHub 链接：https://github.com/gear-dapps/ping
