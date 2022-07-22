---
sidebar_position: 7
sidebar_label: 读取状态
---

# 读取状态

以下查询用于读取程序的状态：

```javascript
const metaWasm = fs.readFileSync('path/to/meta.wasm');
const state = await gearApi.programState.read(programId, metaWasm, inputValue?);
```

`programId` is a payload if program expects it in `meta_state`

如果程序在 `meta_state` 中期待 `programId`，那么`programId`就是一个消息体。


## Cookbook

要在前端应用程序中读取状态，你可以使用`fetch`浏览器 API 从 meta.wasm 获取。

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
