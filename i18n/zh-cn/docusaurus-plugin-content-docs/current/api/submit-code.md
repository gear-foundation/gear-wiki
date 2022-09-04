---
sidebar_position: 5
sidebar_label: 提交代码
---

# 提交代码

如果需要在不初始化的情况下将程序代码加载到链中，请看以下示例：

```javascript
import { GearKeyring } from '@gear-js/api';

const alice = await GearKeyring.fromSuri('//Alice');
const code = fs.readFileSync('path/to/program.opt.wasm');

const { codeHash } = gearApi.code.upload(code);
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
