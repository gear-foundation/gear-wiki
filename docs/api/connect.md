---
sidebar_position: 1
sidebar_label: 'Connect'
---

# Connect API

The API allows us to interact with the chain and make queries via Javascript. The basic API is implemented on the Substrate layer and is the same for all substrate-based networks.

Complete API overview and cookbook is on [Polkadot documentation portal](https://polkadot.js.org/docs/).

Below are a few entry points for interact with Gear:

> ws://127.0.0.1:9944

<!-- // TODO -->
<!-- add Websocket endpoint for GEAR and Canary Gear -->

## Installation

Install Poladot packange with npm or yarn 

```sh
yarn add @polkadot/api
```

## Example
This simple example describes how to subscribe to a new blocks and get chain spec

```js
import { ApiPromise, WsProvider } from '@polkadot/api';

async function connect() {
  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider: wsProvider });

  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);
  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

  api.rpc.chain.subscribeNewHeads(async (header) => {
    console.log(`Block number #${header.number}`);
  });
}
connect().catch(console.error);
```