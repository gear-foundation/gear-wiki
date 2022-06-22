---
sidebar_position: 11
sidebar_label: Calculate gas
---

# Calculate gas

Any operations of the program code execution or processing of messages are paid with gas by the initiator of any of these actions.

To guarantee successful message processing and avoid errors like `Gaslimit exceeded`, you can simulate the execution in advance and calculate the exact value of the gas consumed.


## Calculate gas for messages

Depending on the conditions, you can calculate the gas for initializing the program, processing the message in handle() or reply()

:::info
Gas calculation returns GasInfo object contains 3 parameters:

- `min_limit` - Minimum gas limit required for execution
- `reserved` - Gas amount that will be reserved for some other on-chain interactions
- `burned` - Number of gas burned during message processing
:::

### Init message

```javascript
// get program code
const code = fs.readFileSync('demo_ping.opt.wasm');
const gas = await gearApi.program.calculateGas.init(
  '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d', // source id
  code,
  '0x00', // payload
  0, //value
  true, // allow other panics
);
console.log(gas.toHuman());
```

### Handle 

```javascript
const meta = await getWasmMetadata(fs.readFileSync('demo_meta.opt.wasm'));
const estimatedGas = await gearApi.program.calculateGas.handle(
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

### Reply

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
