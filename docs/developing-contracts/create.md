---
sidebar_label: Create Program
sidebar_position: 7
---

# Create a program from a program

The business logic of any decentralized application may necessitate enabling the program to create, initialize, and launch one or multiple other programs within the network. This capability becomes crucial when external parties, such as users, require access to their unique instance of the standard program.

Let’s take for example a program that implements loan functionality. In this case, the program developer can create a loan factory program that will create instances of loan programs on demand and operate them.

Firstly, to create a program, you have to submit program code to the network using an extrinsic [`gear.uploadCode`](https://docs.gear.rs/pallet_gear/pallet/struct.Pallet.html#method.upload_code) and get its code hash. Submit program code does not initialize the program.

:::info

To submit code you can use our GUI at [Gear IDEA](https://idea.gear-tech.io/) or just submit it via @gear-js/api library. Also you can use `Gear Program` CLI - https://github.com/gear-tech/gear/tree/master/gcli

:::

After the code has been submitted, it can be used to create a new program:

```rust
use gstd::{prog::ProgramGenerator, CodeHash, msg};

#[no_mangle]
extern "C" fn handle() {
    let submitted_code: CodeHash =
        hex_literal::hex!("abf3746e72a6e8740bd9e12b879fbdd59e052cb390f116454e9116c22021ae4a")
            .into();

    // ProgramGenerator returs ProgramId

    let program_id =  ProgramGenerator::create_program_with_gas(submitted_code, b"payload", 10_000_000_000, 0)
        .expect("Unable to create program");

    msg::send(program_id, b"hello", 0).expect("Unable to send message");
}
```

More info about `gstd::prog` module see in https://docs.gear.rs/gstd/prog/index.html
