---
sidebar_position: 5
sidebar_label: Upload Code
---

# Upload code

In certain scenarios, it may be necessary to upload the program code to the blockchain without initializing the program. This means that the resulting code will not be an active program, but rather a code snippet stored on the blockchain that can be used to initialize any number of program instances as needed, depending on your dApp's business logic.

To create an `upload_code` extrinsic that uploads the program code to the blockchain without initialization, use the `GearApi.code.upload` method:

```javascript
const code = fs.readFileSync('path/to/program.opt.wasm');

const { codeHash } = await api.code.upload(code);

api.code.signAndSend(alice, () => {
  events.forEach(({ event: { method, data } }) => {
    if (method === 'ExtrinsicFailed') {
      throw new Error(data.toString());
    } else if (method === 'CodeChanged') {
      console.log(data.toHuman());
    }
  });
});
```

## Create program from uploaded code on chain

Use `api.program.create` method to create `create_program` extrinsic:

```javascript
const codeId = '0x…';

const program = {
  codeId,
  gasLimit: 1000000,
  value: 1000,
  initPayload: somePayload,
};

const { programId, salt, extrinsic } = api.program.create(program, meta);

await extrinsic.signAndSend(keyring, (event) => {
  console.log(event.toHuman());
});
```
