---
sidebar_position: 3
sidebar_label: Calculate gas
---

# Calculate gas

Gear nodes charge gas fees for all network operations, whether that be executing a program’s code or processing a message. This gas is paid by the initiator of these actions.

They guarantee successful message processing and to avoid errors like `Gaslimit exceeded`, you can simulate the execution in advance to calculate the exact value of gas consumed.

## Calculate gas for messages

To find out the minimum gas amount to send extrinsic, use `gearApi.program.calculateGas.[method]`. Depending on the conditions, you can calculate gas for initalizing a program or processing a message in `handle()` or `reply()`.

:::info
Gas calculation returns the GasInfo object, which contains 5 parameters:

- `min_limit` - Minimum gas limit required for execution
- `reserved` - Gas amount that will be reserved for other on-chain interactions
- `burned` - Number of gas burned during message processing
- `may_be_returned` - value that can be returned in some cases
- `waited` - notifies that the message will be added to waitlist
  :::

### Init (for upload_program extrinsic)

```javascript
const code = fs.readFileSync('demo_ping.opt.wasm');

const gas = await gearApi.program.calculateGas.initUpload(
  '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d', // source id
  code,
  '0x00', // payload
  0, //value
  true, // allow other panics
);

console.log(gas.toHuman());
```

### Init (for create_program extrinsic)

```javascript
const codeId = '0x...';

const gas = await gearApi.program.calculateGas.initCreate(
  '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d', // source id
  codeId,
  '0x00', // payload
  0, //value
  true, // allow other panics
);

console.log(gas.toHuman());
```

### Handle

```javascript
const code = fs.readFileSync('demo_meta.opt.wasm');
const meta = await getWasmMetadata(fs.readFileSync('demo_meta.opt.wasm'));
const gas = await gearApi.program.calculateGas.handle(
  '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d', // source id
  '0xa178362715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d', //program id
  {
    id: {
      decimal: 64,
      hex: '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
    },
  }, // payload
  0, // value
  false, // allow other panics
  meta,
);
console.log(gas.toHuman());
```

### Reply to a message

```javascript
const code = fs.readFileSync('demo_async.opt.wasm');
const meta = await getWasmMetadata(fs.readFileSync('demo_async.opt.wasm'));
const gas = await gearApi.program.calculateGas.reply(
  '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d', // source id
  '0x518e6bc03d274aadb3454f566f634bc2b6aef9ae6faeb832c18ae8300fd72635', // message id
  0, // exit code
  'PONG', // payload
  0, // value
  true, // allow other panics
  meta,
);
console.log(gas.toHuman());
```
