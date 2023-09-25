---
sidebar_position: 7
sidebar_label: 读取状态
---

# 读取状态


有两种不同的方式查询程序的 `State`：

1. 查询程序的完整 `State`。要读取程序的完整`State`，需要有这个程序的 `metadata`。你可以调用 `GearApi.programState.read` 方法来获取状态。

```javascript
await gearApi.programState.read({ programId: '0x…' }, programMetadata);
```

此外，你可以在一些特定的块上读取程序的 `State`：

```javascript
await gearApi.programState.read(
  { programId: '0x…', at: '0x…' },
  programMetadata,
);
```

2. 如果你使用自定义函数只查询程序状态的特定部分（[更多内容](/docs/developing-contracts/metadata#generate-metadata)），那么应该调用 `GearApi.programState.readUsingWasm` 方法：

```js
// ...

const wasm = readFileSync('path/to/state.meta.wasm');
const metadata = await getStateMetadata(wasm);

const state = await gearApi.programState.readUsingWasm(
  {
    programId: '0x…',
    fn_name: 'name_of_function_to_execute',
    wasm,
    argument: { input: 'payload' },
  },
  metadata,
);
```

## Cookbook

要在前端应用程序中读取状态，你可以使用 `fetch` 从 `meta.wasm` 中获取内容：

```javascript
// ...

const res = await fetch(metaFile);
const arrayBuffer = await res.arrayBuffer();
const buffer = await Buffer.from(arrayBuffer);
const metadata = await getStateMetadata(buffer);

// get State only of the first wallet
const firstState = await gearApi.programState.readUsingWasm(
  { programId: '0x…', fn_name: 'first_wallet', buffer },
  metadata,
);

// get wallet State by id
const secondState = await gearApi.programState.readUsingWasm(
  { programId: '0x…', fn_name: 'wallet_by_id', buffer,  argument: { decimal: 1, hex: '0x01' } },
  metadata,
);

```
