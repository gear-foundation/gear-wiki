---
sidebar_position: 4
sidebar_label: Upload Program
---

# Upload Program

A smart contract compiled to Wasm can be uploaded to the Gear network as a program. During uploading it is initialized in the network to be able to send and receive messages with other actors in the network (programs and users).

Use `api.program.upload` method to create `upload_program` extrinsic

```javascript
const code = fs.readFileSync('path/to/program.wasm');

const program = {
  code,
  gasLimit: 1000000,
  value: 1000,
  initPayload: somePayload,
};

try {
  const { programId, codeId, salt, extrinsic } = api.program.upload(
    program,
    meta,
  );
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
}

try {
  await extrinsic.signAndSend(keyring, (event) => {
    console.log(event.toHuman());
  });
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
}
```

:::note

For the calculation of the required gas for `init` message processing should use `api.program.calculateGas.initUpload()` method.

[more info](/docs/api/calculate-gas)
:::
