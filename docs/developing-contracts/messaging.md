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

*Gas limit* is the amount of gas that users are willing to spend to process the message.

*Value* is a currency value to be transferred to the target account. In the special message of the initial program upload, the value will be transferred to a balance of the newly created account for the program.

## Types of messages

In the case of the program, there are the following types of messages:

- From user to program
- From program to program
- From program to user
- A special message from the user to upload a new program to the network. The payload must contain the WASM file of the program itself. Target account must not be specified - it will be created as a part of processing message post.

## Gas

Gear node charges a gas fee during message processing. The gas fee is linear - 64000 gas per allocated memory page of size 64KB and 1000 gas per instrumented WASM instruction. Messages from transactions with the highest fee are taken first. In this case, messages from transactions with the lowest fee can be delayed or even never end up in the processing queue. If a transaction is processed before the limit is reached, the rest of the gas will be returned to the sending account.

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
