---
sidebar_label: Create program
sidebar_position: 5
---

# Create program from program

Due to the logic of the execution programs can create other programs.

To create a program, firstly you have to submit program code using an extrinsic `gear.uploadCode` without initializing the program and get its code hash.

:::info
To submit code you can use our GUI [Gear IDEA](https://idea.gear-tech.io/) or just submit it via @gear-js/api library. Also you can use `Gear Program` CLI https://github.com/gear-tech/gear-program
:::

From now we can use this code to create a new program:

```rust
use gstd::{prog::ProgramGenerator, CodeHash};

#[no_mangle]
unsafe extern "C" fn handle() {
    let submitted_code: CodeHash =
        hex_literal::hex!("abf3746e72a6e8740bd9e12b879fbdd59e052cb390f116454e9116c22021ae4a")
            .into();

    ProgramGenerator::create_program_with_gas(submitted_code, b"payload", 10_000_000_000, 0)
        .unwrap();
}
```

[See more](https://docs.gear.rs/gstd/prog/index.html) about `gstd::prog` module
