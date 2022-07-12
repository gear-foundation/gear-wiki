---
sidebar_position: 2
sidebar_label: Keyring
---

# Keyring

Keyring 使你能够管理你的密钥对（账户），以执行各种的操作，包括签署、验证和加密/解密。私钥永远不会暴露在外部。

## 创建 keyring

创建新的 keyring

```javascript
import { GearKeyring } from '@gear-js/api';
const { keyring, json } = await GearKeyring.create('keyringName', 'passphrase');
```

从 JSON 得到 keyring

```javascript
const jsonKeyring = fs.readFileSync('path/to/keyring.json').toString();
const keyring = GearKeyring.fromJson(jsonKeyring, 'passphrase');
```

keyring 转换为 JSON

```javascript
const json = GearKeyring.toJson(keyring, 'passphrase');
```

从 seed 中得到 keyring

```javascript
const seed = '0x496f9222372eca011351630ad276c7d44768a593cecea73685299e06acef8c0a';
const keyring = await GearKeyring.fromSeed(seed, 'name');
```

从助记词中得到 keyring

```javascript
const mnemonic = 'slim potato consider exchange shiver bitter drop carpet helmet unfair cotton eagle';
const keyring = GearKeyring.fromMnemonic(mnemonic, 'name');
```

生成助记词 和 seed

```javascript
const { mnemonic, seed } = GearKeyring.generateMnemonic();

// Getting a seed from mnemonic
const { seed } = GearKeyring.generateSeed(mnemonic);
```

## 默认账号

在大多数情况下，在开发链上，Substrate 有许多标准账户是预先注资的。一般在开发链上操作的时候，都会给你介绍`Alice`、`Bob`、`Charlie`、`Dave`、`Eve`和`Ferdie`这样的角色。要从预先安装的账户中创建 Keyring，请使用：

```javascript
const keyring = await GearKeyring.fromSuri('//Alice');
```

