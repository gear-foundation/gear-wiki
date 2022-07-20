---
sidebar_position: 3
sidebar_label: 计算 Gas
---

# 计算 gas

Gear 节点对所有的网络操作收取 gas，无论是执行程序的代码还是处理信息。gas 是由这些行动的发起者支付的。它们保证了信息处理的成功，为了避免像 `Gaslimit exceeded` 这样的错误，你可以提前模拟执行，计算出 gas 消耗的准确值。

## 为消息计算 gas

根据条件，你可以在 `handle()` 或 `reply()` 中计算出启动程序或处理信息的 gas。

:::info
gas 计算返回 GasInfo 对象，其中包含 3 个参数。

- `min_limit` - 执行所需的最少 gas 极限
- `reserved` - 为其他链上交互保留的 gas
- `burned` - 消息处理期间燃烧的 gas 数量
:::

### 初始化消息

```javascript
// get program code
const code = fs.readFileSync('demo_ping.opt.wasm');
const gas = await gearApi.program.calculateGas.init(
  '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d', // source id
  code,
  '0x00', // payload
  0, // value
  true, // allow other panics
);
console.log(gas.toHuman());
```

### Handle 方法

```javascript
const meta = await getWasmMetadata(fs.readFileSync('demo_meta.opt.wasm'));
const estimatedGas = await gearApi.program.calculateGas.handle(
  '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d', // source id
  '0xa178362715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d', // program id
  {
    id: {
      decimal: 64,
      hex: '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
    },
  }, // payload
  0, // value
  false, // allow other panics
  meta,
);
console.log(gas.toHuman());
```

### Reply 方法

```javascript
const code = fs.readFileSync('demo_async.opt.wasm');
const meta = await getWasmMetadata(fs.readFileSync('demo_async.opt.wasm'));
const gas = await gearApi.program.calculateGas.reply(
  '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d', // source id
  '0x518e6bc03d274aadb3454f566f634bc2b6aef9ae6faeb832c18ae8300fd72635', // message id
  0, // exit code
  'PONG', // payload
  0, // value
  true, // allow other panics
  meta,
);
console.log(gas.toHuman());
```
