---
sidebar_position: 8
sidebar_label: Metadata & Type Creation
---

# Basics & Metadata / Type creation

在 Gear 程序的上下文中，元数据促进了客户端 (javascript) 和程序 (Rust) 之间的交互。元数据是一种接口映射，可以帮助识别一组字节并将其排序为可理解的结构，并指出它的功能是什么。元数据存储在一个单独的 *.meta.wasm 文件中，在解码的情况下，它将包含一个通用结构：

```javascript
interface Metadata {
  init_input?: string;
  init_output?: string;
  async_init_input?: string;
  async_init_output?: string;
  handle_input?: string;
  handle_output?: string;
  async_handle_input?: string;
  async_handle_output?: string;
  title?: string;
  types?: string;
  meta_state_input?: string;
  meta_state_output?: string;
}
```

从 `meta.wasm` 文件中得到元数据：

```javascript

import { getWasmMetadata } from '@gear-js/api';
const fileBuffer = fs.readFileSync('path/to/program.meta.wasm');
const meta = await getWasmMetadata(fileBuffer);

```

## Types

元数据是由其组成的类型来定义的。关于基本类型和方法的更多信息可以在 Polkadot 的[文档](https://polkadot.js.org/docs/api/start/types.basics) 中找到。

如果由于某种原因，你需要“手动”创建一个类型来对任何消息体进行编码/解码。

```javascript
import { CreateType } from '@gear-js/api';

// If "TypeName" already registered. Lear more https://polkadot.js.org/docs/api/start/types.create#choosing-how-to-create
const result = CreateType.create('TypeName', somePayload);

// Otherwise need to add metadata containing TypeName and all required types
const result = CreateType.create('TypeName', somePayload, metadata);
```

这个函数的结果是`Codec`类型的数据，它有以下方法：

```javascript
result.toHex(); // - returns a hex represetation of the value
result.toHuman(); // - returns human-friendly object representation of the value
result.toString(); //  - returns a string representation of the value
result.toU8a(); // - encodes the value as a Unit8Array
result.toJSON(); // - converts the value to JSON
```