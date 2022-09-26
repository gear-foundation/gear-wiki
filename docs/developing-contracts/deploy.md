---
sidebar_label: Upload Program
sidebar_position: 5
---

# Deploy smart contracts

Uploading a new program (smart-contract) to the blockchain takes place by calling the custom extrinsic `gear.uploadProgram(code, salt, initPayload, gasLimit, value)`. Where:

`code: Bytes` - binary WASM code.

`salt: Bytes` - the random data that is added to the hashing process to force their uniqueness.

`initPayload: Bytes`- the init message payload that will be processed by the init() function during program initialization.

`gasLimit: u64` - is the amount of gas that users are willing to spend on processing the upload of a new program.

`value: u128` - the value that will be transferred to a balance of the newly created account for the program.

## Program submit events

The extrinsic called to submit a program triggers a series of events. [Learn more about events](/docs/api/events#gear-events-types)

## How to deploy

There are several ways to deploy a program:

### Upload via Gear GUI

The easiest way to deploy the program is to use the “Upload program” option in the official website [idea.gear-tech.io](https://idea.gear-tech.io).

![img alt](./img/idea-upload.png)

### Via gear-js library

Gear-js library provides a simple and intuitive way to connect GEAR Component APIs, including interaction with programs. More details [Gear API](/docs/api/getting-started).

### Via `gear-program`

`gear-program` is the command line (CLI) utility for interacting with the blockchain network. Refer to [gear-program GitHub repo](https://github.com/gear-tech/gear-program) for details.
