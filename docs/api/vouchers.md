---
sidebar_position: 7
sidebar_label: Vouchers
---

# Gas vouchers

Vouchers, issued by any actor empower users with gas-free interactions, enabling them to send messages to specific programs seamlessly.

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

Use `api.voucher.exists` method to check that the voucher exists for a particular user and program:

```javascript
const voucherExists = await api.voucher.exists(programId, accountId);
```

To send message with voucher set `prepaid` flag to `true` in the first argument of `api.message.send` and `api.message.sendReply` methods. Also it's good to specify account ID that is used to send the extrinsic to check whether the voucher exists or not.

```javascript
let massage = await api.message.send({
  destination: destination,
  payload: somePayload,
  gasLimit: 10000000,
  value: 1000,
  prepaid: true,
  account: accountId,
}, meta);
```

An example of using vouchers is shown in the [Battleship](/examples/battleship.md) game. Users without tokens on their balance can make moves by sending messages to a program using a voucher.
