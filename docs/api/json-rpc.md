---
sidebar_position: 12
sidebar_label: JSON-RPC methods
---

# JSON-RPC methods

Gear provides a set of JSON-RPC methods to interact with Gear pallets. 

The JSON-RPC methods of other pallets used in the chain are also available and can be found in the [Substrate JSON-RPC documentation](https://polkadot.js.org/docs/substrate/rpc).

## Gear pallets

### Calculate gas for Init message (upload_program extrinsic)

- summary: The method allows to calculate gas for Init message (upload_program extrinsic)
- method name: `gear_calculateGasForUpload`
- structure: `calculateGasForUpload(source: H256, code: Vec<u8>, payload: Vec<u8>, value: u128, allow_other_panics: bool): GasInfo`
- gear-js/api method: `api.program.calculateGas.initUpload`

### Calculate gas for Init message (create_program extrinsic)

- summary: The method allows to calculate gas for Init message (create_program extrinsic)
- method name: `gear_calculateGasForCreate`
- structure: `calculateGasForCreate(source: H256, codeId: H256, payload: Vec<u8>, value: u128, allow_other_panics: bool): GasInfo`
- gear-js/api method: `api.program.calculateGas.initCreate`

### Calculate gas for Handle message (send_message extrinsic)

- summary: The method allows to calculate gas for Handle message (send_message extrinsic)
- method name: `gear_calculateGasForHandle`
- structure: `calculateGasForHandle(source: H256, destination: H256, payload: Vec<u8>, value: u128, allow_other_panics: bool): GasInfo`
- gear-js/api method: `api.program.calculateGas.handle`

### Calculate gas for Reply message (send_reply extrinsic)

- summary: The method allows to calculate gas for Reply message (send_reply extrinsic)
- method name: `gear_calculateGasForReply`
- structure: `calculateGasForReply(source: H256, message_id: H256, payload: Vec<u8>, value: u128, allow_other_panics: bool): GasInfo`
- gear-js/api method: `api.program.calculateGas.reply`

### Read the metahash of a program metadata

- summary: The method allows to read the metahash of a program metadata
- method name: `gear_readMetahash`
- structure: `readMetahash(program_id: H256, at: Option<BlockHash>): H256`
- gear-js/api method: `api.program.metaHash`

### Read the state of a program

- summary: The method allows to read the state of a program
- method name: `gear_readState`
- structure: `readState(program_id: H256, payload: Vec<u8>, at: Option<BlockHash>): Bytes`
- gear-js/api method: `api.program.readState`

### Сollect reply details

- summary: The method allows to run queue with the message to collect reply details: payload, value and reply code.
- method name: `gear_calculateReplyForHandle`
- structure: `calculateReplyForHandle(origin: H256, destination: H256, payload: Vec<u8>, gas_limit: u64, value: u128, at: Option<BlockHash>): ReplyInfo`
- gear-js/api method: `api.message.calculateReply`