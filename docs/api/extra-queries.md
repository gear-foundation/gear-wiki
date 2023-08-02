---
sidebar_position: 11
sidebar_label: Cookbook
---

# Cookbook

Here is collected a set of useful code snippets in a question-answer format:

### Get block data

```javascript
const data = await api.blocks.get(blockNumberOrBlockHash);
console.log(data.toHuman());
```

### Get block timestamp

```javascript
const ts = await api.blocks.getBlockTimestamp(blockNumberOrBlockHash);
console.log(ts.toNumber());
```

### Get blockHash by block number

```javascript
const hash = await api.blocks.getBlockHash(blockNumber);
console.log(hash.toHex());
```

### Get block number by blockhash

```javascript
const hash = await api.blocks.getBlockNumber(blockHash);
console.log(hash.toNumber());
```

### Get all block's events

```javascript
const events = await api.blocks.getEvents(blockHash);
events.forEach((event) => {
  console.log(event.toHuman());
});
```

### Get all block's extrinsics

```javascript
const extrinsics = await api.blocks.getExtrinsics(blockHash);
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

## Sign data

Create signature

```javascript
import { GearKeyring } from '@gear-js/api';
const message = 'your message';
const signature = GearKeyring.sign(keyring, message);
```

Validate signature

```javascript
import { signatureIsValid } from '@gear-js/api';
const publicKey = keyring.address;
const verified = signatureIsValid(publicKey, signature, message);
```

## Convert public keys into ss58 format and back

Use `encodeAddress` and `decodeAddress` functions to convert the public key into ss58 format and back.

Convert to raw format

```javascript
import { decodeAddress } from '@gear-js/api';
console.log(decodeAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'));
```

Convert to ss58 format

```javascript
import { encodeAddress } from '@gear-js/api';
console.log(
  encodeAddress(
    '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
  ),
);
```
