---
sidebar_position: 8
sidebar_label: 元数据 与 Type Creation
---

# Basics & Metadata / Type creation

元数据实现了客户端（JavaScript 应用程序）和智能合约（Rust 程序）之间的交互。元数据是一种接口映射，可以将一组字节码识别为可理解的结构，并将其排序，并展示出它所要实现的功能。

元数据有两种类型。

## ProgramMetadata

`ProgramMetadata` 用于编码/解码进出程序的信息，并读取**整个程序**的 `State`。在这种情况下，元数据看起来像一个十六进制字符串，并在 Gear 程序编译时自动生成。

要获取程序的元数据，请使用 `getProgramMetadata` 方法：

```javascript
import { getProgramMetadata } from '@gear-js/api';

const metadata = getProgramMetadata(`0x...`);

// 函数 getProgramMetadata() 以十六进制格式获取程序的元数据
// 它返回一个 `ProgramMetadata` 类的对象，其属性 `types` 包含所有程序类型

metadata.types.init.input; // 程序初始化的输入信息
metadata.types.init.output; // 程序初始化的输出信息
 // input/output 可用于程序的所有入口处

metadata.types.state; // contains type for decoding state output
```

## StateMetadata

这是处理元数据最方便的方式。它可以创建任何自定义函数，只查询程序状态的特定部分，而不是读取整个程序的状态。这对于具有大状态的大型程序来说是特别有用的。

为了读取程序 `State` 的自定义实现，可以调用`StateMetadata` 函数来获取元数据。该函数将 `meta.wasm` 作为 `Buffer` 来读取 `State`。它返回 `StateMetadata` 类的对象，该类具有查询程序 `State` 的功能。

```js
import { getStateMetadata } from '@gear-js/api';

const fileBuffer = fs.readFileSync('path/to/state.meta.wasm');
const metadata = await getStateMetadata(fileBuffer);
metadata.functions; //  是一个对象，其键是函数名称，值是输入/输出类型的对象
```

## 元数据类方法

`ProgramMetadata` 和 `StateMetadata` 类都有一些方法，可以帮助了解一个或另一个类型是什么，以及获得类型的名称（因为类型在注册表中以数字表示）。此外，还有一些编码和解码数据的方法。

```js
import { ProgramMetadata } from '@gear-js/api`;

const metadata = getProgramMetadata(`0x...`);

// 返回具有此索引的类型的名称
metadata.getTypeName(4);

// 返回该类型的结构
metadata.getTypeDef(4);

// 如果需要得到一个带有额外字段（name，type，kind，len）的类型结构，必须传递第二个参数
metadata.getTypeDef(4, true);

// 返回所有存在于程序注册表中的自定义类型
metadata.getAllTypes();

// 使用指定类型编码或解码 payload
metadata.createType(4, { value: 'value' });
```

## Type creation

关于基本类型和方法的更多信息可以在 Polkadot 的[文档](https://polkadot.js.org/docs/api/start/types.basics)中找到。

如果出于某种原因，你需要“手动”创建一个类型来对任何消息体进行编码/解码。

```javascript
import { CreateType } from '@gear-js/api';

// 如果 "TypeName" 已经注册，可以使用以下方式。更多内容请看 https://polkadot.js.org/docs/api/start/types.create#choosing-how-to-create
const result = CreateType.create('TypeName', somePayload);

// Otherwise need to add metadata containing TypeName and all required types
 // 否则需要添加包含 TypeName 和所有必要类型的元数据
const result = CreateType.create('TypeName', somePayload, metadata);
```

这个函数的结果是 `Codec` 类型的数据，它有以下方法：

```javascript
result.toHex(); // - returns a hex represetation of the value
result.toHuman(); // - returns human-friendly object representation of the value
result.toString(); //  - returns a string representation of the value
result.toU8a(); // - encodes the value as a Unit8Array
result.toJSON(); // - converts the value to JSON
```