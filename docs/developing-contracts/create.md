---
sidebar_label: Create program
sidebar_position: 5
---

# Create program from program

Business logic of an arbitrary decentralized application may require the program (smart contract) the possibility of creating, initializing and launching one or several other programs in the network. It can be necessary when external parties (users) need access to their own instance of the typical smart contract. 

For example a contract that implements loan functionality. In this case, the program developer can create a loan factory contract that will create instances of loan smart contracts on demand and operate them.

Firstly, to create a program, you have to submit program code to the network using an extrinsic `gear.uploadCode` and get its code hash. Submit program code does not initialize the program.

:::info
To submit code you can use our GUI at [Gear IDEA](https://idea.gear-tech.io/) or just submit it via @gear-js/api library. Also you can use `Gear Program` CLI - https://github.com/gear-tech/gear-program
:::

After the code has been submitted, it can be used to create a new program:

```rust
use gstd::{prog::ProgramGenerator, CodeHash, msg};

#[no_mangle]
unsafe extern "C" fn handle() {
    let submitted_code: CodeHash =
        hex_literal::hex!("abf3746e72a6e8740bd9e12b879fbdd59e052cb390f116454e9116c22021ae4a")
            .into();

    // ProgramGenerator returs ProgramId         

    let program_id =  ProgramGenerator::create_program_with_gas(submitted_code, b"payload", 10_000_000_000, 0).unwrap();
    
    msg::send(program_id, b"hello", 0).expect("Unable to send message");

}
```

More info about `gstd::prog` module see in https://docs.gear.rs/gstd/prog/index.html

