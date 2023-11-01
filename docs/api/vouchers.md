---
sidebar_position: 7
sidebar_label: Vouchers
---

# Gas vouchers

Vouchers, issued by any actor empower users with gas-free interactions, enabling them to send messages to specific programs seamlessly.

An example of using vouchers is shown in the [Battleship](/examples/Gaming/battleship.md) game. Users without tokens on their balance can make moves by sending messages to a program using a voucher.

### Issue a voucher

Use `api.voucher.issue` method to issue a new voucher for a user to be used to pay for sending messages to `program_id` program.

```javascript
  import { VoucherIssued } from '@gear-js/api';

  const programId = '0x..';
  const account = '0x...';
  const tx = api.voucher.issue(account, programId, 10000);
  tx.signAndSend(account, (events) => {
    const voucherIssuedEvent = events.events.filter(({event: {method}}) => method === 'VoucherIssued') as VoucherIssued;
    console.log(voucherIssuedEvent.toJSON());
  })
```

### Check voucher

Use `api.voucher.exists` method to check that the voucher exists for a particular user and program:

```javascript
const voucherExists = await api.voucher.exists(programId, accountId);
```

### Send a message using voucher

To send message with voucher you can use `api.voucher.call` method:

```javascript
  const messageTx = api.message.send({
    destination: destination,
    payload: somePayload,
    gasLimit: 10000000,
    value: 1000
  }, meta);

  const voucherTx = api.voucher.call({ SendMessage: messageTx });
  await voucherTx.signAndSend(account, (events) => {
    console.log(events.toHuman());
  });
```
### Send a reply using voucher

Sending a reply with issued voucher works similar to sending message with voucher:

```javascript
  const messageTx = api.message.sendReply(...);

  const voucherTx = api.voucher.call({ SendReply: messageTx });
  await voucherTx.signAndSend(account, (events) => {
    console.log(events.toHuman());
  });
```

