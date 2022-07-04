---
sidebar_position: 8
sidebar_label: Submit Code
---

# Submit Code

If we need to load the program code into the chain without initialization, we can look at the following example:

```javascript

import { GearKeyring } from '@gear-js/api';

const alice = await GearKeyring.fromSuri('//Alice');
const code = fs.readFileSync('path/to/program.opt.wasm');

const { codeHash } = gearApi.code.submit(code);
gearApi.code.signAndSend(alice, () => {
  events.forEach(({ event: { method, data } }) => {
    if (method === 'ExtrinsicFailed') {
      throw new Error(data.toString());
    } else if (method === 'CodeSaved') {
      console.log(data.toHuman());
    }
  });
});
```
