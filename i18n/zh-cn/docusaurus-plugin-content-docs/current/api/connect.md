---
sidebar_position: 1
sidebar_label: 'Connect'
---

# Connect API

该 API 允许我们与链进行交互，并通过 Javascript 进行查询。基本的 API 是在 Substrate 实现的，对所有基于底层的网络都是一样的。

完整的 API 手册在[Polkadot 文档](https://polkadot.js.org/docs/)。

以下是与 Gear 交互的几个切入点：

> ws://127.0.0.1:9944

<!-- // TODO -->
<!-- add Websocket endpoint for GEAR and Canary Gear -->

## Installation

```sh
npm install @gear-js/api
```

## Getting started

启动一个 API 连接到 localhost 的运行节点上

```javascript
import { GearApi } from '@gear-js/api';

const gearApi = await GearApi.create();
```

你也可以连接到一个不同的节点

```javascript
const gearApi = await GearApi.create({ provider: 'wss://someIP:somePort' });
```

注册自定义类型

```javascript
const yourCustomTypesExample = {
  Person: {
    surname: 'String',
    name: 'String',
    patronymic: 'Option<String>'
  },
  Id: {
    decimal: 'u64',
    hex: 'Vec<u8>'
  },
  Data: {
    id: 'Id',
    person: 'Person',
    data: 'Vec<String>'
  }
};
const gearApi = await GearApi.create({ customTypes: { ...yourCustomTypesExample } });
```

## Example

这个简单的例子描述了如何订阅一个新的区块并获取链基础信息：

```js
async function connect() {
  const gearApi = await GearApi.create();

  const [chain, nodeName, nodeVersion] = await Promise.all([
    gearApi.api.rpc.system.chain(),
    gearApi.api.rpc.system.name(),
    gearApi.api.rpc.system.version(),
  ]);
  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

  gearApi.gearEvents.subscribeNewBlocks((header) => {
    console.log(`New block with number: ${header.number.toNumber()} and hash: ${header.hash.toHex()}`);
  });
}
connect().catch(console.error);
```
