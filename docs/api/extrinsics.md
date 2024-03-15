---
sidebar_position: 13
sidebar_label: Extrinsics
---

# Extrinsics

Gear provides a set of extrinsics to interact with the gear pallets. The extrinsics of other pallets used in the chain are also available. Find the list of the other extrinsics in the [Extrinsics](https://polkadot.js.org/docs/substrate/extrinsics).

`author_submitExtrinsic` method is used to submit an extrinsic to the chain.

## gear

#### uploadCode(code: Bytes)

- summary: Saves program `code` in storage.
- gear-js/api method: `api.code.upload`

#### uploadProgram(code: Bytes, salt: Bytes, init_payload: Bytes, gas_limit: u64, value: u128, keep_alive: bool)

- summary: Creates program initialization request (message), that is scheduled to be run in the same block.
- gear-js/api method: `api.program.upload`

#### createProgram(code_id: H256, salt: Bytes, init_payload: Bytes, gas_limit: u64, value: u128, keep_alive: bool)

- summary: Creates program via `code_id` from storage.
- gear-js/api method: `api.program.create`

#### sendMessage(destination: H256, payload: Bytes, gas_limit: u64, value: u128, keep_alive: bool)

- summary: Sends a message to a program or to another account.
- gear-js/api method: `api.message.send`

#### sendReply(reply_to_id: H256, payload: Bytes, gas_limit: u64, value: u128, keep_alive: bool)

- Send reply on message in `Mailbox`.
- gear-js/api method: `api.message.sendReply`

#### claim_value(message_id: H256)

- summary: Claim value from message in `Mailbox`.
- gear-js/api method: `api.mailbox.claimValue.submit`

## gearVoucher

#### issue(spender: H256, balance: u128, programs: Option<BTreeSet<ProgramId>>, code_uploading: bool, duration: BlockNumber)

- summary: Issue a new voucher.
- gear-js/api method: `api.voucher.issue`
 
#### call(voucher_id: H256, call: PrepaidCall<BalanceOf>)

- summary: Execute prepaid call with given voucher id.
- gear-js/api method: `api.voucher.call`

#### revoke(spender: H256, voucher_id: H256)

- summary: Revoke existing voucher.
- gear-js/api method: `api.voucher.revoke`

#### update(spender: AccountId, voucher_id: VoucherId, move_ownership: Option<AccountId>, balance_top_up: Option<BalanceOf>, append_programs: Option<Option<BTreeSet<ProgramId>>>, code_uploading: Option<bool>, prolong_duration: Option<BlockNumber>)

- summary: Update existing voucher.
- gear-js/api method: `api.voucher.update`