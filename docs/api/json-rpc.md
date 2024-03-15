---
sidebar_position: 12
sidebar_label: JSON-RPC methods
---

# JSON-RPC methods

Gear provides a set of JSON-RPC methods to interact with the gear pallets. The JSON-RPC methods of other pallets used in the chain are also available. Find the list of the other methods in the [JSON-RPC](https://polkadot.js.org/docs/substrate/rpc).

---
## gear
#### calculateGasForUpload(source: H256, code: Vec<u8>, payload: Vec<u8>, value: u128, allow_other_panics: bool): GasInfo

- method name: `gear_calculateGasForUpload`
- summary: Calculate gas for Init message (upload_program extrinsic)
- gear-js/api method: `api.program.calculateGas.initUpload`

#### calculateGasForCreate(source: H256, codeId: H256, payload: Vec<u8>, value: u128, allow_other_panics: bool): GasInfo

- method name: `gear_calculateGasForCreate`
- summary: Calculate gas for Init message (create_program extrinsic)
- gear-js/api method: `api.program.calculateGas.initCreate`

#### calculateGasForHandle(source: H256, destination: H256, payload: Vec<u8>, value: u128, allow_other_panics: bool): GasInfo

- method name: `gear_calculateGasForHandle`
- summary: Calculate gas for Handle message (send_message extrinsic)
- gear-js/api method: `api.program.calculateGas.handle`

#### calculateGasForReply(source: H256, message_id: H256, payload: Vec<u8>, value: u128, allow_other_panics: bool): GasInfo

- method name: `gear_calculateGasForReply`
- summary: Calculate gas for Reply message (send_reply extrinsic)
- gear-js/api method: `api.program.calculateGas.reply`

#### readMetahash(program_id: H256, at: Option<BlockHash>): H256

- method name: `gear_readMetahash`
- summary: Read the metahash of a program metadata
- gear-js/api method: `api.program.metaHash`

#### readState(program_id: H256, payload: Vec<u8>, at: Option<BlockHash>): Bytes

- method name: `gear_readState`
- summary: Read the state of a program
- gear-js/api method: `api.program.readState`

#### calculateReplyForHandle(origin: H256, destination: H256, payload: Vec<u8>, gas_limit: u64, value: u128, at: Option<BlockHash>): ReplyInfo

- method name: `gear_calculateReplyForHandle`
- summary: The method allows to run queue with the message to collect reply details: payload, value and reply code.
- gear-js/api method: `api.message.calculateReply`