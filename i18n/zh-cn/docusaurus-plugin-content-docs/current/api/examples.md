---
sidebar_position: 3
sidebar_label: '范例'
---

# 范例

这里有一些小的代码片断，以问答的形式开始与主要的 Gear 组件进行互动。

### 订阅

订阅所有事件

```javascript
gearApi.events((event) => {
  console.log(event.toHuman());
});
```

订阅日志事件

```javascript
gearApi.gearEvents.subscribeLogEvents((event) => {
  const data: any = event.data[0].toHuman();
  console.log(data);
});
```

订阅项目事件

```javascript
gearApi.gearEvents.subsribeProgramEvents((event) => {
  console.log(event.toHuman());
});
```

### Creating custom types

使用在创建 API 时注册的类型

```javascript
const createType = new CreateType(gearApi);
```

而没有他们

```javascript
const createType = new CreateType();
```

编码

```javascript
// If "TypeName" alredy registred
createType.encode('TypeName', somePayload);
// Otherwise need to add metadata containing TypeName and all required types
createType.encode('TypeName', somePayload, metadata);
```

以此类推，数据解码

```javascript
createType.decode('TypeName', someBytes);
// or
createType.decode('TypeName', someBytes, metadata);
```

### 创建 keyring

创建一个新的 keyring

```javascript
import { GearKeyring } from '@gear-js/api';
const { keyring, json } = await GearKeyring.create('keyringName');
```

从 JSON 文件得到 keyring

```javascript
const jsonKeyring = fs.readFileSync('path/to/keyring.json').toString();
const keyring = GearKeyring.fromJson(jsonKeyring);
```

### 获取元数据

从 program.meta.wasm 获取元数据

```javascript
import { getWasmMetadata } from '@gear-js/api';
const fileBuffer = fs.readFileSync('path/to/program.meta.wasm');
const meta = await getWasmMetadata(fileBuffer);
```

### 上传程序

上传程序

```javascript
const code = fs.readFileSync('path/to/program.wasm');

const uploadProgram = {
  code,
  gasLimit: 1000000,
  value: 1000,
  initPayload: somePayload
};

try {
  const programId = await gearApi.program.submit(uploadProgram, meta);
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
}

try {
  await gearApi.program.signAndSend(keyring, (data) => {
    console.log(data);
  });
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
}
```

### 发送消息

发送消息

```javascript
try {
  const message = {
    destination: destination, // programId
    payload: somePayload,
    gasLimit: 10000000,
    value: 1000
  };
  await gearApi.message.submit(message, meta);
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
}
try {
  await gearApi.message.signAndSend(keyring, (data) => {
    console.log(data);
  });
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
}
```

## [范例](https://github.com/gear-tech/gear-js-lib/tree/master/examples)

更多例子请看 https://github.com/gear-tech/gear-js-lib/tree/master/examples
