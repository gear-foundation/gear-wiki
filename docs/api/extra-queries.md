---
sidebar_position: 10
sidebar_label: Cookbook
---

# Cookbook

Some batch of useful code snippets in a question-answer format:

## Subscribe to new blocks

```javascript
const unsub = await gearApi.gearEvents.subscribeToNewBlocks((header) => {
  console.log(`New block with number: ${header.number.toNumber()} and hash: ${header.hash.toHex()}`);
});
// Unsubscribe
unsub();
```

### Get block data

```javascript
const data = await gearApi.blocks.get(blockNumberOrBlockHash);
console.log(data.toHuman());
```

### Get block timestamp

```javascript
const ts = await gearApi.blocks.getBlockTimestamp(blockNumberOrBlockHash);
console.log(ts.toNumber());
```

### Get blockHash by block number

```javascript
const hash = await gearApi.blocks.getBlockHash(blockNumber);
console.log(hash.toHex());
```

### Get block number by blockhash

```javascript
const hash = await gearApi.blocks.getBlockNumber(blockHash);
console.log(hash.toNumber());
```

### Get all block's events

```javascript
const events = await gearApi.blocks.getEvents(blockHash);
events.forEach((event) => {
  console.log(event.toHuman());
});
```

### Get all block's extrinsics

```javascript
const extrinsics = await gearApi.blocks.getExtrinsics(blockHash);
extrinsics.forEach((extrinsic) => {
  console.log(extrinsic.toHuman());
});
```

## Get transaction fee

```javascript
const api = await GearApi.create();
api.program.submit({ code, gasLimit });
// same for api.message, api.reply and others
const paymentInfo = await api.program.paymentInfo(alice);
const transactionFee = paymentInfo.partialFee.toNumber();
consolg.log(transactionFee);
```


