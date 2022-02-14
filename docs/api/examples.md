---
sidebar_position: 3
sidebar_label: 'Examples'
---

# Examples
Here are small code snippets in a question-answer format for start to interact with the main Gear component.

### Encode / decode payloads

Encode data

```javascript
import { CreateType } from '@gear-js/api';

// If "TypeName" alredy registred
const result = CreateType.encode('TypeName', somePayload);
// Otherwise need to add metadata containing TypeName and all required types
const result = CreateType.encode('TypeName', somePayload, metadata);
```

By analogy data is decoded

```javascript
const result = CreateType.decode('TypeName', someBytes);
// or
const result = CreateType.decode('TypeName', someBytes, metadata);
```

Result of this functions is data of type `Codec` and it has the next methods

```javascript
result.toHex(); // - returns a hex represetation of the value
result.toHuman(); // - returns human friendly object representation of the value
result.toString(); //  - returns a string represetation of the value
result.toU8a(); // - encodes the value as a Unit8Array
result.toJSON(); // - converts the value to JSON
```

### Getting metadata

Getting metadata from program.meta.wasm

```javascript
import { getWasmMetadata } from '@gear-js/api';
const fileBuffer = fs.readFileSync('path/to/program.meta.wasm');
const meta = await getWasmMetadata(fileBuffer);
```

### Sign messages

Creating signature

```javascript
import { GearKeyring } from '@gear-js/api';
const message = 'your message';
const signature = GearKeyring.sign(keyring, message);

// Check signature
const publicKey = keyring.address;
const verified = GearKeyring.checkSign(publicKey, signature, message);
```

### Upload program

```javascript
const code = fs.readFileSync('path/to/program.wasm');

const program = {
  code,
  gasLimit: 1000000,
  value: 1000,
  initPayload: somePayload,
};

try {
  const programId = await gearApi.program.submit(uploadProgram, meta);
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
}

try {
  await gearApi.program.signAndSend(keyring, (event) => {
    console.log(event.toHuman());
  });
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
}
```

### Send message

```javascript
try {
  const message = {
    destination: destination, // programId
    payload: somePayload,
    gasLimit: 10000000,
    value: 1000,
  };
  // In that case payload will be encoded using meta.handle_input type
  await gearApi.message.submit(message, meta);
  // So if you want to use another type you can specify it
  await gearApi.message.submit(message, meta, meta.async_handle_input); // For example
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
}
try {
  await gearApi.message.signAndSend(keyring, (event) => {
    console.log(event.toHuman());
  });
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
}
```

### Read state of program

```javascript
const metaWasm = fs.readFileSync('path/to/meta.wasm');
const state = gearApi.programState.read(programId, metaWasm);
// If program expects inputValue in meta_state function it's possible to specify it
const state = gearApi.programState.read(programId, metaWasm, inputValue);
```

### Subscribe to events

Subscribe to all events

```javascript
const unsub = await gearApi.allEvents((events) => {
  console.log(event.toHuman());
});
// Unsubscribe
unsub();
```

Check what the event is

```javascript
gearApi.allEvents((events) => {
  events
    .filter(({ event }) => gearApi.events.gear.InitMessageEnqueued.is(event))
    .forEach(({ event: { data } }) => {
      console.log(data.toHuman());
    });

  events
    .filter(({ event }) => gearApi.events.balances.Transfer.is(event))
    .forEach(({ event: { data } }) => {
      console.log(data.toHuman());
    });
});
```

Subscribe to Log events

```javascript
const unsub = await gearApi.gearEvents.subscribeLogEvents(({ data: { id, source, dest, payload, reply } }) => {
  console.log(`
  logId: ${id.toHex()}
  source: ${source.toHex()}
  payload: ${payload.toHuman()}
  `);
});
// Unsubscribe
unsub();
```

Subscribe to Program events

```javascript
const unsub = await gearApi.gearEvents.subscribeProgramEvents(({ method, data: { info, reason } }) => {
  console.log(method);
  console.log(`ProgramId: ${info.programId}`);
  reason && console.log(`Reason: ${reason.toHuman()}`);
});
// Unsubscribe
unsub();
```

Subscribe to Transfer events

```javascript
const unsub = await gearApi.gearEvents.subscribeTransferEvents(({ data: { from, to, value } }) => {
  console.log(`
    Transfer balance:
    from: ${from.toHex()}
    to: ${to.toHex()}
    value: ${+value.toString()}
    `);
});
// Unsubscribe
unsub();
```

Subscribe to new blocks

```javascript
const unsub = await gearApi.gearEvents.subscribeToNewBlocks((header) => {
  console.log(`New block with number: ${header.number.toNumber()} and hash: ${header.hash.toHex()}`);
});
// Unsubscribe
unsub();
```

### Get blockHash by block number

```javascript
const hash = await gearApi.blocks.getBlockHash(blockNumber);
console.log(hash.toHex());
```

### Get block number by blockhash

```javascript
const hash = await gearApi.blocks.getBlockNumber(blockHash);
console.log(hash.toNumber());
```

### Get all block's events

```javascript
const events = await gearApi.blocks.getEvents(blockHash);
events.forEach((event) => {
  console.log(event.toHuman());
});
```

### Get all block's extrinsics

```javascript
const extrinsics = await gearApi.blocks.getExtrinsics(blockHash);
extrinsics.forEach((extrinsic) => {
  console.log(extrinsic.toHuman());
});
```

### Create keyring

Creating a new keyring

```javascript
import { GearKeyring } from '@gear-js/api';
const { keyring, json } = await GearKeyring.create('keyringName', 'passphrase');
```

Getting a keyring from JSON

```javascript
const jsonKeyring = fs.readFileSync('path/to/keyring.json').toString();
const keyring = GearKeyring.fromJson(jsonKeyring, 'passphrase');
```

Getting JSON for keyring

```javascript
const json = GearKeyring.toJson(keyring, 'passphrase');
```

Getting a keyring from seed

```javascript
const seed = '0x496f9222372eca011351630ad276c7d44768a593cecea73685299e06acef8c0a';
const keyring = await GearKeyring.fromSeed(seed, 'name');
```

Getting a keyring from mnemonic

```javascript
const mnemonic = 'slim potato consider exchange shiver bitter drop carpet helmet unfair cotton eagle';
const keyring = GearKeyring.fromMnemonic(mnemonic, 'name');
```

Generate mnemonic and seed

```javascript
const { mnemonic, seed } = GearKeyring.generateMnemonic();

// Getting a seed from mnemonic
const { seed } = GearKeyring.generateSeed(mnemonic);
```
