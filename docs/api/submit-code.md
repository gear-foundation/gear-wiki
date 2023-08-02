---
sidebar_position: 5
sidebar_label: Upload Code
---

# Upload code

If you need to load the program code into the chain without initialization use `GearApi.code.upload` method to create `upload_code` extrinsic:

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
