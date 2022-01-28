---
sidebar_label: "Message Format"
sidebar_position: 3
---

# Message communication format

Interaction with each program takes place by messaging.

Messages in Gear have common interface with the following parameters:

```
source account,
target account,
payload,
gas_limit
value
```

`gas_limit` is the amount of gas that users are willing to spend to process the message.

`value` is a value to be transferred to the target account. In the special message of the initial program upload, the value will be transferred to a balance of the newly created account for the program.

## Types of messages

In the case of the program, there are the following types of messages:

- From user to program
- From program to program
- From program to the user
- A special message from the user to upload a new program to the network. The payload must contain the Wasm file of the program itself. Target account must not be specified - it will be created as a part of processing message post.


## Gas

Gear node charges a gas fee during message processing. The gas fee is linear - 64000 gas per allocated memory page of size 64KB and 1000 gas per instrumented Wasm instruction. Messages from transactions with the highest fee are taken first. In this case, messages from transactions with the lowest fee can be delayed or even never end up in the processing queue. If a transaction is processed before the limit is reached, the rest of the gas will be returned to the sending account.

## Message process module

Depending on the context the program interprets messages differently. To process messages in Gear programs, the proprietary `gstd` standart library and the `::msg` module is used. All available functions described in msg.rs in gstd:

[github link](https://github.com/gear-tech/gear/blob/master/gstd/src/msg.rs)

Load bytes and try to decode to the specified type with `SCALE codec`:

```rust
pub fn load<D: Decode>() -> Result<D, codec::Error> {
    D::decode(&mut load_bytes().as_ref())
}
```

Load bytes:

```rust
pub fn load_bytes() -> Vec<u8> {
    let mut result = vec![0u8; gcore::msg::size()];
    gcore::msg::load(&mut result[..]);
    result
}
```

Reply to a message and try to enecode to the specified type with `SCALE codec`. Returns `MessageId`:

```rust
pub fn reply<E: Encode>(payload: E, gas_limit: u64, value: u128) -> MessageId {
    reply_bytes(&payload.encode(), gas_limit, value)
}
```

Reply to a message with bytes in `payload`. Returns `MessageId`:

```rust
pub fn reply_bytes<T: AsRef<[u8]>>(payload: T, gas_limit: u64, value: u128) -> MessageId {
    gcore::msg::reply(payload.as_ref(), gas_limit, value)
}
```

## Understandble messages. Encode/Decode

Gear uses the `parity-scale-codec`, a Rust implementation of the SCALE Codec. SCALE is a lightweight format that allows encoding (and decoding) which makes it highly suitable for resource-constrained execution environments like blockchain runtimes and low-power, low-memory devices.

```rust
#[derive(Encode, Decode)]
```

[Learn more about SCALE Codec](https://substrate.dev/docs/en/knowledgebase/advanced/codec)
