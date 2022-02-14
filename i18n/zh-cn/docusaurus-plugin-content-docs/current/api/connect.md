---
sidebar_position: 1
sidebar_label: '连接'
---

# Connect API

该 API 允许我们与链进行交互，并通过 Javascript 进行查询。基本的 API 是在 Substrate 实现的，对所有基于底层的网络都是一样的。

完整的 API 手册在[Polkadot 文档](https://polkadot.js.org/docs/)。

以下是与 Gear 交互的几个切入点：

> ws://127.0.0.1:9944

<!-- // TODO -->
<!-- add Websocket endpoint for GEAR and Canary Gear -->

## 安装

```sh
npm install @gear-js/api
```

or

```sh
yarn add @gear-js/api
```

## 开始

启动一个 API 连接到运行的 localhost 节点上

```javascript
import { GearApi } from '@gear-js/api';

const gearApi = await GearApi.create();
```

你也可以连接到不同节点

```javascript
const gearApi = await GearApi.create({
  providerAddress: 'wss://someIP:somePort',
});
```

获取节点信息

```javascript
const chain = await gearApi.chain();
const nodeName = await gearApi.nodeName();
const nodeVersion = await gearApi.nodeVersion();
const genesis = gearApi.genesisHash.toHex();
```

## 范例

这个简单的例子描述了如何订阅一个新的区块并获取链基础信息：

```js
async function connect() {
  const gearApi = await GearApi.create();

  const [chain, nodeName, nodeVersion] = await Promise.all([
    gearApi.chain(),
    gearApi.nodeName(),
    gearApi.nodeVersion(),
  ]);
  console.log(
    `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`,
  );

  const unsub = await gearApi.gearEvents.subscribeToNewBlocks((header) => {
    console.log(
      `New block with number: ${header.number.toNumber()} and hash: ${header.hash.toHex()}`,
    );
  });
}
connect().catch(console.error);
```
