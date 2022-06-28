---
sidebar_position: 2
sidebar_label: Keyring
---

# Keyring

Keyring enables you to manage your key pair (account) to perform a wide range of operations, including signing, verifying and encrypting/decrypting.


## Create keyring

Creating a new keyring

```javascript
import { GearKeyring } from '@gear-js/api';
const { keyring, json } = await GearKeyring.create('keyringName', 'passphrase');
```

Getting a keyring from JSON

```javascript
const jsonKeyring = fs.readFileSync('path/to/keyring.json').toString();
const keyring = GearKeyring.fromJson(jsonKeyring, 'passphrase');
```

Getting JSON for keyring

```javascript
const json = GearKeyring.toJson(keyring, 'passphrase');
```

Getting a keyring from seed

```javascript
const seed = '0x496f9222372eca011351630ad276c7d44768a593cecea73685299e06acef8c0a';
const keyring = await GearKeyring.fromSeed(seed, 'name');
```

Getting a keyring from mnemonic

```javascript
const mnemonic = 'slim potato consider exchange shiver bitter drop carpet helmet unfair cotton eagle';
const keyring = GearKeyring.fromMnemonic(mnemonic, 'name');
```

Generate mnemonic and seed

```javascript
const { mnemonic, seed } = GearKeyring.generateMnemonic();

// Getting a seed from mnemonic
const { seed } = GearKeyring.generateSeed(mnemonic);
```

## Default Accounts

In most cases on development chains, Substrate has a number of standard accounts that are pre-funded. Generally when operating on development chains, you will be introduced to characters such as `Alice`, `Bob`, `Charlie`, `Dave`, `Eve` and `Ferdie`. To create keyring from pre-installed accounts use:

```javascript
const keyring = await GearKeyring.fromSuri('//Alice');
```

