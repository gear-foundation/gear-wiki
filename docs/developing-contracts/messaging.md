---
sidebar_label: Message Format
sidebar_position: 3
---

# Message communication format

Interaction with each program takes place by messaging.

Messages in Gear have common interface with the following parameters:

- Source account
- Target account
- Payload,
- Gas limit
- Value

_Gas limit_ is the amount of gas that users are willing to spend to process the message.

_Value_ is a currency value to be transferred to the target account. In the special message of the initial program upload, the value will be transferred to a balance of the newly created account for the program.

## Types of messages

In the case of the program, there are the following types of messages:

- From user to program
- From program to program
- From program to user
- A special message from the user to upload a new program to the network. The payload must contain the WASM file of the program itself. Target account must not be specified - it will be created as a part of processing message post.

## Gas

Gas is a special currency for paying for blockchain computing. Its formation occurs by exchanging value with a special coefficient (currently = 1, but this may change in the future if the network votes).
Gas is related to weight based on a one-to-one ratio. One unit of weight is one picosecond of computation. In order for the block to fit into a specific execution time, we calculate its gas allowance available for spending, but we do not exceed it.

Based on the fact that one unit of weight equals one unit of gas,which takes one picosecond of calculations, we used benchmarks on average hardware to determine the cost of all available wasm instructions, including our syscalls

## Message process module

Depending on the context the program interprets messages differently. To process messages in Gear programs, the `msg` module from the proprietary `gstd` standard library is used. All available functions described here:

https://docs.gear.rs/gstd/msg/index.html

## Understandable messages. Encode/Decode traits

Gear uses the `parity-scale-codec`, a Rust implementation of the SCALE Codec. SCALE is a lightweight format that allows encoding/decoding which makes it highly suitable for resource-constrained execution environments like blockchain runtimes and low-power/low-memory devices.

```rust
#[derive(Encode, Decode)]
enum MyType {
    MyStruct { field: ... },
    ...
}
```

[Learn more about SCALE Codec](https://substrate.dev/docs/en/knowledgebase/advanced/codec)
