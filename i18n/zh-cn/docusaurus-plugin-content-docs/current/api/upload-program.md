---
sidebar_position: 4
sidebar_label: 上传程序
---

# 上传程序

编译为 Wasm 的智能合约可以作为程序上传到 Gear 网络。在上传期间，它在网络中被初始化，以便能够与网络中的其他参与者（程序和用户）发送和接收消息。

```javascript
const code = fs.readFileSync('path/to/program.wasm');

const program = {
  code,
  gasLimit: 1000000,
  value: 1000,
  initPayload: somePayload,
};

try {
  const { programId, salt, submitted } = await gearApi.program.upload(
    uploadProgram,
    meta,
  );
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

:::note
对于计算`init`信息处理所需的 gas，应该使用`api.program.calculateGas.initUpload()`。

请看[更多相关信息](/api/calculate-gas)
:::