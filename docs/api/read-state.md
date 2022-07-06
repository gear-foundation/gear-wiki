---
sidebar_position: 7
sidebar_label: Read State
---

# Read State

The following query is used to read the state of the program:

```javascript
const metaWasm = fs.readFileSync('path/to/meta.wasm');
const state = await gearApi.programState.read(programId, metaWasm, inputValue?);
```
`programId` is a payload if program expects it in `meta_state`

## Cookbook

To read state in front-end applications you can use `fetch` browser API to get buffer from meta.wasm

```javascript

const state = fetch(metaFile)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => Buffer.from(arrayBuffer))
      .then((buffer) =>
        api.programState.read(ID_CONTRACT_ADDRESS, buffer, {
          AnyPayload: 'Null',
        }),
      )
      .then((state) => state.toHuman())
      
```
