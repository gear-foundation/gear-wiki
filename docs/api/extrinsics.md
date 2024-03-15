---
sidebar_position: 13
sidebar_label: Extrinsics
---

# Extrinsics

Gear provides a set of extrinsics to interact with the Gear pallets. 

The extrinsics of other pallets used in the chain are also available and can be found in the [Substrate Extrinsics documentation](https://polkadot.js.org/docs/substrate/extrinsics).

`author_submitExtrinsic` method is used to submit an extrinsic to the chain.

## Gear pallets methods

### Save program's `code` in storage

- summary: The method saves the program's `code` in storage, which can later be used to initialize the program from it.
- struct: `uploadCode(code: Bytes)`
- gear-js/api method: `api.code.upload`

### Program init in the same block

- summary: Creates program initialization request (message), that is scheduled to be run in the same block.
- struct: `uploadProgram(code: Bytes, salt: Bytes, init_payload: Bytes, gas_limit: u64, value: u128, keep_alive: bool)`
- gear-js/api method: `api.program.upload`

### Create program from `code`

- summary: Creates program via `code_id` from storage.
- struct: `createProgram(code_id: H256, salt: Bytes, init_payload: Bytes, gas_limit: u64, value: u128, keep_alive: bool)`
- gear-js/api method: `api.program.create`

### Send message

- struct: `sendMessage(destination: H256, payload: Bytes, gas_limit: u64, value: u128, keep_alive: bool)`
- summary: Sends a message to a program or to another account.
- gear-js/api method: `api.message.send`

### Send reply

- struct: `sendReply(reply_to_id: H256, payload: Bytes, gas_limit: u64, value: u128, keep_alive: bool)`
- summary: Sends a reply to a message in the `Mailbox`.
- gear-js/api method: `api.message.sendReply`

### Claim value from message

- struct: `claim_value(message_id: H256)`
- summary: Claims value from a message in the `Mailbox`.
- gear-js/api method: `api.mailbox.claimValue.submit`

## Gear Voucher

### Issue a new voucher

- struct: `issue(spender: H256, balance: u128, programs: Option<BTreeSet<ProgramId>>, code_uploading: bool, duration: BlockNumber)`
- summary: Issues a new voucher at the spender's expense to be used in a specific program.
- gear-js/api method: `api.voucher.issue`
 
### Execute prepaid call with given voucher

- struct: `call(voucher_id: H256, call: PrepaidCall<BalanceOf>)`
- summary: Execute prepaid call with given voucher id.
- gear-js/api method: `api.voucher.call`

### Revoke voucher

- struct: `revoke(spender: H256, voucher_id: H256)` 
- summary: Revokes an existing voucher.
- gear-js/api method: `api.voucher.revoke`

### Update voucher

- struct: `update(spender: AccountId, voucher_id: VoucherId, move_ownership: Option<AccountId>, balance_top_up: Option<BalanceOf>, append_programs: Option<Option<BTreeSet<ProgramId>>>, code_uploading: Option<bool>, prolong_duration: Option<BlockNumber>)`
- summary: Updates an existing voucher.
- gear-js/api method: `api.voucher.update`