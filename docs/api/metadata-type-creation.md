---
sidebar_position: 6
sidebar_label: Metadata & Type Creation
---

# Basics & Metadata / Type creation

In the context of Gear programs, metadata allows the interaction of the client part (javascript) and the program (Rust). Metadata is a kind of interface map that helps to identify a set of bytes into an understandable structure and indicates the function it is intended for. Metadata is stored in a separate *.meta.wasm file and, in case of decoding it will contain a common structure:

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

To get metadata from `meta.wasm` file:

```javascript

import { getWasmMetadata } from '@gear-js/api';
const fileBuffer = fs.readFileSync('path/to/program.meta.wasm');
const meta = await getWasmMetadata(fileBuffer);

```

## Types

Metadata defines by the types of which it consists. More information about the basic types and methods of work can be found in the main documentation of Polkadot [here](https://polkadot.js.org/docs/api/start/types.basics)

If for some reason you need to create a type "manually" for encode/decode any payload:

```javascript
import { CreateType } from '@gear-js/api';

// If "TypeName" already registered. Lear more https://polkadot.js.org/docs/api/start/types.create#choosing-how-to-create
const result = CreateType.create('TypeName', somePayload);

// Otherwise need to add metadata containing TypeName and all required types
const result = CreateType.create('TypeName', somePayload, metadata);
```

The result of this function is data of type `Codec` and it has the next methods

```javascript
result.toHex(); // - returns a hex represetation of the value
result.toHuman(); // - returns human-friendly object representation of the value
result.toString(); //  - returns a string representation of the value
result.toU8a(); // - encodes the value as a Unit8Array
result.toJSON(); // - converts the value to JSON
```

## Cookbook