---
sidebar_position: 7
sidebar_label: Vouchers
---

# Gas Vouchers

Vouchers empower users with gas-free interactions, allowing seamless messaging to specific programs from any actor.

An example of using vouchers is shown in the [Battleship](docs/examples/Gaming/Battleship/battleship.md) game. Users without tokens on their balance can make moves by sending messages to a program using a voucher.

### Issue a Voucher

Use the `api.voucher.issue` method to issue a new voucher for a user, which can be used to pay for sending messages to programs.

```javascript
import { VoucherIssued } from '@gear-js/api';

const programs = ['0x1234...', '0x5678...'];
const spenderAddress = '0x...';
const validForOneHour = (60 * 60) / 3; // number of blocks in one hour

const { extrinsic } = await api.voucher.issue(spenderAddress, 100 * 10 ** 12, validForOneHour, programs, true);

// To enable the voucher for code uploading, set the last argument of the `.issue` method to true.

extrinsic.signAndSend(account, ({ events }) => {
  const voucherIssuedEvent = events.find(({event: { method }}) => method === 'VoucherIssued')?.event as VoucherIssued;

  if (voucherIssuedEvent) {
    console.log(voucherIssuedEvent.toJSON());
  }
})
```

### Check Voucher Existence

The `api.voucher.exists` method verifies the existence of a voucher for a specific user and program. It returns a boolean value indicating whether the voucher exists.

```javascript
const voucherExists = await api.voucher.exists(accountId, programId)
```

### Retrieve All Vouchers for an Account

The `api.voucher.getAllForAccount` method retrieves an object in which the key is the voucher ID and the value is an array of programs for which the voucher can be utilized.

```javascript
const allVouchers = await api.voucher.getAllForAccount(accountId);
```

### Get voucher details
```javascript
const details = api.voucher.details(spenderAddress, voucherId);
console.log(`Voucher details:
  owner: ${details.owner}
  programs: ${details.programs}
  expiry: ${details.expiry}`);
```

### Send a Message Using the Issued Voucher

To send a message with a voucher, you can use the `api.voucher.call` method.

```javascript
const messageTx = api.message.send({
  destination: destination,
  payload: somePayload,
  gasLimit: 10000000,
  value: 1000
}, meta);

const voucherTx = api.voucher.call(voucherId, { SendMessage: messageTx });
await voucherTx.signAndSend(account, (events) => {
  console.log(events.toHuman());
});
```

### Send a Reply with an Issued Voucher

Sending a reply with an issued voucher works in the same way as sending a message with a voucher.

```javascript
const messageTx = api.message.sendReply(...);

const voucherTx = api.voucher.call(voucherId, { SendReply: messageTx });
await voucherTx.signAndSend(account, (events) => {
  console.log(events.toHuman());
});
```

### Upload Code with an Issued Voucher

```javascript
const { extrinsic } = await api.code.upload(code);

const tx = api.voucher.call(voucherId, { UploadCode: extrinsic })
await tx.signAndSend(account, (events) => {
  console.log(events.toHuman());
});
```

### Update a Voucher

The `api.voucher.update` method can be used to update a voucher. All parameters in the third argument are optional; however, at least one parameter must be specified.

```javascript
const tx = await api.voucher.update(
  spenderAddress, 
  voucherId,
  {
    moveOwnership: newOwnerAddress, // The new voucher owner
    balanceTopUp: 1_000 * 10 ** 12, // Top up voucher balance
    appendPrograms: ['0x9123...', '0x4567...'], // Append programs for which the voucher can be used
    prolongValidity: 1_000_000 // Prolong the voucher validity for 1_000_000 blocks
  }
)
```

### Revoke a Voucher

The `api.voucher.revoke` method is used to revoke an issued voucher. A voucher can only be revoked after its validity period has expired. Unused funds are returned to a voucher issuer.

```javascript
const tx = api.voucher.revoke(spenderAddress, voucherId);
tx.signAndSend(...);
```

### Decline a Voucher

The `api.voucher.decline` method can be used to decline an existing voucher that has not yet expired. This action will mark the voucher as expired so you will be able to Revoke it.

```javascript
const tx = api.voucher.decline(voucherId);
tx.signAndSend(...);
```

### Get Voucher Constants

```javascript
// Minimum and maximum duration of the voucher in blocks
const minBlocks = await api.voucher.minDuration();
const maxBlocks = await api.voucher.maxDuration();

// Maximum amount of programs that can be added to the voucher
const maxProgramsAmount = await api.voucher.maxProgramsAmount();
```