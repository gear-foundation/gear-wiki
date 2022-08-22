---
sidebar_label: Upload Program
sidebar_position: 5
---

# Deploy smart contracts

Following the principles of Actor model for communication, creating a program is just one of the specific types of transactions that contain a WASM file as a payload.

Uploading a new program (smart-contract) to the blockchain takes place by calling the custom extrinsic `gear.uploadProgram(code, salt, initPayload, gasLimit, value)`. Where:

`code: Bytes` - binary WASM code.

`salt: Bytes` - the random data that is added to the hashing process to force their uniqueness.

`initPayload: Bytes`- the init message payload that will be processed by the init() function during program initialization.

`gasLimit: u64` - is the amount of gas that users are willing to spend on processing the upload of a new program.

`value: u128` - the value that will be transferred to a balance of the newly created account for the program.

## Program submit events

> Note: while extrinsics represent information from the outside world, events represent information from the chain. Extrinsics can trigger events.

The extrinsic called to submit a program triggers a series of events. They appear this way:

1. Gear network tries to post a message into the queue that aims to verify the source account has enough balance to cover sending of value and gas_limit.

2. Block producer of Gear network posts the message into the block.

3. Gear network reserves a maximum amount of gas specified by the user to be spent on program initialization.

4. Program creation and an init message enqueue:

```sh
MessageInfo example:

{
  messageId: 0x4b92a8589e06def4ce06257138ae6fd16c44d065abee9580b4b607fe3c85baa2
  programId: 0xf33843d1481416928d0a432cf357ee3e4dc562a2a963505a8efec75febb4f9de
  origin: 0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d
}
```

5. Program initialization process. `gear.InitSuccess` or `gear.InitFailure` events.

> `programId` is the unique address of the program.

## How to deploy

There are several ways to deploy a program:

### Upload via Gear GUI

The easiest way to deploy the program is to use the “Upload program” option in the official website [idea.gear-tech.io](https://idea.gear-tech.io).

![img alt](./img/idea-upload.png)

### Via Polkadot.js.org

Also, you can use the standard GUI for substrate-based projects to submit a program. It's the [polkadot{.js}](https://polkadot.js.org) app. Use `gear.uploadProgram` extrinsic in Developer -> Extrinsic menu.

![img alt](./img/polkadot-gui.png)

### Via gear-js library

Gear-js library provides a simple and intuitive way to connect GEAR Component APIs, including interaction with programs. More details [Gear API](/docs/api/getting-started).

### Via `gear-program`

`gear-program` is the command line (CLI) utility for interacting with the blockchain network. Refer to [gear-program GitHub repo](https://github.com/gear-tech/gear-program) for details.
