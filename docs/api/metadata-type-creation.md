---
sidebar_position: 8
sidebar_label: Metadata & Type Creation
---

# Basics & Metadata / Type creation

Metadata enables interaction between the client side (JavaScript application) and the smart-contract (Rust program). Metadata is a kind of interface map that can help to identify and order a set of bytes into an understandable structure and indicates the function it is intended for.

There are two types of metadata.

## ProgramMetadata

`ProgramMetadata` is used to encode/decode messages to/from a program and to read the **entire program's** `State`. In this case, metadata looks like a hex string and generates automatically while the Gear program compiles.

To get program metadata, use the `getProgramMetadata` function:

```javascript
import { getProgramMetadata } from '@gear-js/api';

const metadata = getProgramMetadata('0x…');

// The function getProgramMetadata() takes the program's metadata in the format of a hex string.
// It returns an object of the `ProgramMetadata` class with the property `types` containing all program types.

metadata.types.init.input; // can be used to encode input message for init entrypoint of the program
metadata.types.init.output; // can be used to decode output message for init entrypoint of the program
// the same thing available for all entrypoints of the program

metadata.types.state; // contains type for decoding state output
```

## StateMetadata

This is the most convenient way to work with metadata. It enables creating arbitrary custom functions to query only specific parts of the program state instead of reading the entire program’s state. This will be especially useful for large programs with big state.

In order to use a custom implementation of reading a program `State`, you should call the `StateMetadata` function to get metadata.
The function takes `meta.wasm` as `Buffer` to read the `State`. It returns the object of the `StateMetadata` class that has functions to query the program's `State`.

```js
import { getStateMetadata } from '@gear-js/api';

const fileBuffer = fs.readFileSync('path/to/state.meta.wasm');
const metadata = await getStateMetadata(fileBuffer);
metadata.functions; // is an object whose keys are names of functions and values are objects of input/output types
```

## Metadata class methods

Both `ProgramMetadata` and `StateMetadata` classes have a few methods that can help to understand what one or another type is as well as get the name of a type (because types are represented as numbers in the registry). Also, there is some method for encoding and decoding data.

```js
import { ProgramMetadata } from '@gear-js/api`;

const metadata = getProgramMetadata('0x…');

// returns the name of the type with this index
metadata.getTypeName(4);

// returns the structure of this type
metadata.getTypeDef(4);

// if you need to get a type structure with an additional field (name, type, kind, len) you have to pass the second argument
metadata.getTypeDef(4, true);

// returns all custom types that existed in the registry of the program
metadata.getAllTypes();

// encode or decode payload with indicated type
metadata.createType(4, { value: 'value' });
```

## Type creation

More information about the basic types and methods of work can be found in the main documentation of Polkadot [here](https://polkadot.js.org/docs/api/start/types.basics)

If for some reason you need to create a type "manually" to encode/decode any payload:

```javascript
import { CreateType } from '@gear-js/api';

// If "TypeName" already registered.
// Learn more https://polkadot.js.org/docs/api/start/types.create#choosing-how-to-create
const result = CreateType.create('TypeName', somePayload);

// Otherwise need to add metadata containing TypeName and all required types
const result = CreateType.create('TypeName', somePayload, metadata);
```
The result of this function is data of type `Codec` and it has the following methods:

```javascript
result.toHex();     // returns a hex represetation of the value
result.toHuman();   // returns human-friendly object representation of the value
result.toString();  // returns a string representation of the value
result.toU8a();     // encodes the value as a Unit8Array
result.toJSON();    // converts the value to JSON
```
