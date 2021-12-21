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

```sh
npm install @gear-js/api 
```

## Getting started

Start an API connection to a running node on localhost

```javascript
import { GearApi } from '@gear-js/api';

const gearApi = await GearApi.create();
```

You can also connect to a different node

```javascript
const gearApi = await GearApi.create({ providerAddress: 'wss://someIP:somePort' });
```

Registering custom types

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

This simple example describes how to subscribe to a new blocks and get chain spec:

```js
async function connect() {
  const gearApi = await GearApi.create();

  const [chain, nodeName, nodeVersion] = await Promise.all([
    gearApi.chain(),
    gearApi.nodeName(),
    gearApi.nodeVersion(),
  ]);
  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

  gearApi.gearEvents.subscribeNewBlocks((header) => {
    console.log(`New block with number: ${header.number.toNumber()} and hash: ${header.hash.toHex()}`);
  });
}
connect().catch(console.error);
```