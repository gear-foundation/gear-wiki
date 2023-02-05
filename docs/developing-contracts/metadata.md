---
sidebar_label: Metadata
sidebar_position: 5
---

# Matadata

Metadata is a kind of interface map that helps to transform a set of bytes into an understandable structure and indicates the function this structure is intended for. Metadata determines how all incoming and outgoing data will be encoded/decoded.

Metadata allows dApp’s parts - the smart-contract and the client side (JavaScript), to understand each other and exchange data.

To describe metadata interface use `gmeta` crate:

```rust
use gmeta::{InOut, Metadata};

pub struct ProgramMetadata;

// Be sure to describe all the types.
// But if any of the endpoints is missing in your program, you can use ();
// as indicated in the case of `type Signal`.

impl Metadata for ProgramMetadata {
    type Init = InOut<MessageInitIn, MessageInitOut>;
    type Handle = InOut<MessageIn, MessageOut>;
    type Others = InOut<MessageAsyncIn, Option<u8>>;
    type Reply = InOut<String, Vec<u16>>;
    type Signal = ();
    type State = Vec<Wallet>;
}
```

As we can see, metadata enables you to determine the expected data at the input/output for the contract at each endpoint. Where:

- `Init` - describes incoming/outgoing types for `init()` function.
- `Handle` - describes incoming/outgoing types for `handle()` function.
- `Others` - describes incoming/outgoing types for `main()` function in case of asyncronius interaction.
- `Reply` - describes incoming/outgoing types of message performed using the `handle_reply` function.
- `Signal` - describes only the outgoing type from the program while processing the system signal.
- `State` - describes the types for the queried State

## Genarate metadata

To generate metadata, the following `build.rs` file in the root of your project folder is required:

```rust
// build.rs
// Where ProgramMetadata is your metadata structure

use meta_io::ProgramMetadata;

fn main() {
    gear_wasm_builder::build_with_metadata::<ProgramMetadata>();
}
```

As a result of the smart-contract compilation, a `meta.txt` file will be generated. This metadata file can be used in the UI applications that will interact with this smart-contract. The file’s content looks like a hex string:

```
01000000000103000000010500000001090000000102000000010d000000010f0000000111000000000112000000a9094c00083064656d6f5f6d6574615f696f344d657373616765496e6974496e0000080118616d6f756e74040108753800012063757272656e6379080118537472696e6700000400000503000800000502000c083064656d6f5f6d6574615f696f384d657373616765496e69744f7574000008013465786368616e67655f72617465100138526573756c743c75382c2075383e00010c73756d04010875380000100418526573756c740804540104044501040108084f6b040004000000000c457272040004000001000014083064656d6f5f6d6574615f696f244d657373616765496e000004010869641801084964000018083064656d6f5f6d6574615f696f084964000008011c646563696d616c1c010c75363400010c68657820011c5665633c75383e00001c000005060020000002040024083064656d6f5f6d6574615f696f284d6573736167654f7574000004010c7265732801384f7074696f6e3c57616c6c65743e00002804184f7074696f6e040454012c0108104e6f6e6500000010536f6d6504002c00000100002c083064656d6f5f6d6574615f696f1857616c6c6574000008010869641801084964000118706572736f6e300118506572736f6e000030083064656d6f5f6d6574615f696f18506572736f6e000008011c7375726e616d65080118537472696e670001106e616d65080118537472696e6700003400000238003800000504003c083064656d6f5f6d6574615f696f384d6573736167654173796e63496e0000040114656d707479400108282900004000000400004404184f7074696f6e04045401040108104e6f6e6500000010536f6d650400040000010000480000022c00
```

## Verify metadata

To make it possible to verify metadata for a program, you can use the `metahash()` function. It allows verifying metadata on-chain.

```rust
#[no_mangle]
// It returns the Hash of metadata.
// .metahash is generating automatically while you are using build.rs
extern "C" fn metahash() {
    let metahash: [u8; 32] = include!("../.metahash");
    msg::reply(metahash, 0).expect("Failed to share metahash");
}
```
