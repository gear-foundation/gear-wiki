---
sidebar_position: 11
sidebar_label: 示例
---

# 示例

这里收集了一组以问答形式出现的有用的代码片段。

## 订阅新块

```javascript
const unsub = await gearApi.gearEvents.subscribeToNewBlocks((header) => {
  console.log(`New block with number: ${header.number.toNumber()} and hash: ${header.hash.toHex()}`);
});
// Unsubscribe
unsub();
```

### 获取块数据

```javascript
const data = await gearApi.blocks.get(blockNumberOrBlockHash);
console.log(data.toHuman());
```

### 获取块时间戳

```javascript
const ts = await gearApi.blocks.getBlockTimestamp(blockNumberOrBlockHash);
console.log(ts.toNumber());
```

### 通过块高度得到 blockHash

```javascript
const hash = await gearApi.blocks.getBlockHash(blockNumber);
console.log(hash.toHex());
```

###  通过 blockHash 得到块高度

```javascript
const hash = await gearApi.blocks.getBlockNumber(blockHash);
console.log(hash.toNumber());
```

### 获取所有块的事件

```javascript
const events = await gearApi.blocks.getEvents(blockHash);
events.forEach((event) => {
  console.log(event.toHuman());
});
```

### 获取所有块的 extrinsics

```javascript
const extrinsics = await gearApi.blocks.getExtrinsics(blockHash);
extrinsics.forEach((extrinsic) => {
  console.log(extrinsic.toHuman());
});
```

## Get transaction fee 获取

```javascript
const gearApi = await GearApi.create();
api.program.submit({ code, gasLimit });
// same for gearApi.message, gearApi.reply and others
const paymentInfo = await gearApi.program.paymentInfo(alice);
const transactionFee = paymentInfo.partialFee.toNumber();
consolg.log(transactionFee);
```
