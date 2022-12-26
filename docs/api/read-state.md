---
sidebar_position: 7
sidebar_label: Read State
---

# Read State

There is two different ways to query program State:

1. Query the full State of the program. To read the full State of the program you need to have only `metadata` of this program. You can call api.programState.read method to get the state.

```javascript
await api.programState.read({ programId: `0x...` }, programMetadata);
```

Also you can read the State of the program at some specific block:

```javascript
await api.programState.read(
  { programId: `0x...`, at: `0x...` },
  programMetadata,
);
```

2. If you are using the custom functions to query only specific parts of the program State ([see more](/docs/developing-contracts/metadata#genarete-metadata)), then you should to call `api.programState.readUsingWasm` method:

```js
// ...

const wasm = readFileSync('path/to/state.meta.wasm');
const metadata = await getStateMetadata(wasm);

const state = await api.programState.programState(
  {
    programId,
    fn_name: 'name_of_function_to_execute',
    wasm,
    argument: { input: 'payload' },
  },
  metadata,
);
```

## Cookbook

To read state in front-end applications you can use `fetch` browser API to get buffer from `meta.wasm`:

```javascript
// ...

const res = await fetch(metaFile);
const arrayBuffer = await res.arrayBuffer();
const buffer = await Buffer.from(arrayBuffer);
const metadata = await getStateMetadata(buffer);

// get State only of the first wallet
const firstState = await api.programState.readUsingWasm(
  { programId, fn_name: 'first_wallet', buffer },
  metadata,
);

// get wallet State by id 
const secondState = await api.programState.readUsingWasm(
  { programId, fn_name: 'wallet_by_id', buffer,  argument: { decimal: 1, hex: '0x01' } },
  metadata,
);

```
