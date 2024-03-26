---
sidebar_position: 7
sidebar_label: Vouchers
---

# Gas vouchers

Vouchers empower users with gas-free interactions, allowing seamless messaging to specific programs from any actor.

An example of using vouchers is shown in the [Battleship](/examples/Gaming/battleship.md) game. Users without tokens on their balance can make moves by sending messages to a program using a voucher.

### Issue a voucher
Use `api.voucher.issue` method to issue a new voucher for a user to be used to pay for sending messages to programs.

```javascript
import { VoucherIssued } from '@gear-js/api';

const programs = ['0x1234...', '0x5678...'];
const spenderAddress = '0x...';
const validForOneHour = (60 * 60) / 3; // number of blocks in one hour

const { extrinsic } = await api.voucher.issue(spenderAddress, 100 * 10 ** 12, validForOneHour, programs, true);

// To allow the voucher to be used for code uploading, set the last argument of the `.issue` method to true

extrinsic.signAndSend(account, ({ events }) => {
  const voucherIssuedEvent = events.find(({event: { method }}) => method === 'VoucherIssued')?.event as VoucherIssued;

  if (voucherIssuedEvent) {
    console.log(voucherIssuedEvent.toJSON());
  }
})
```

### Check that the voucher exists for a particular user and program
The `api.voucher.exists` method returns a boolean value indicates whether the voucher exists or not.
```javascript
const voucherExists = await api.voucher.exists(accountId, programId)
```

### Get all voucher for an account
The `api.voucher.getAllForAccount` method returns an object whose key is the voucher id and value is an array of programs for which the voucher can be used.
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

### Send a message with the issued voucher
To send message with voucher you can use `api.voucher.call` method.
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

### Send a reply with issued voucher
It works in the same way as sending message with voucher
```javascript
const messageTx = api.message.sendReply(...);

const voucherTx = api.voucher.call(voucherId, { SendReply: messageTx });
await voucherTx.signAndSend(account, (events) => {
  console.log(events.toHuman());
});
```

### Upload code with issued voucher
```javascript
const { extrinsic } = await api.code.upload(code);

const tx = api.voucher.call(voucherId, { UploadCode: extrinsic })
await tx.signAndSend(account, (events) => {
  console.log(events.toHuman());
});
```

### Update voucher
The `api.voucher.update` can be used to update the voucher. All parameters in the 3rd argument are optional, but at least one parameter must be specified.
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

### Revoke voucher
The `api.voucher.revoke` is used to revoke an issued voucher. It's possible to revoke a voucher only after the validity period has expired.
```javascript
const tx = api.voucher.revoke(spenderAddress, voucherId);
tx.signAndSend(...);
```

### Decline voucher
The `api.voucher.decline` can be used to decline existing and not expired voucher. It will make the voucher expired
```javascript
const tx = api.voucher.decline(voucherId);
tx.signAndSend(...);
```

### Get the the voucher constants
```javascript
// Minimum and maximum duration of the voucher in blocks
const minBlocks = await api.voucher.minDuration();
const maxBlocks = await api.voucher.maxDuration();

// Maximum amount of programs that can be added to the voucher
const maxProgramsAmount = await api.voucher.maxProgramsAmount();
```