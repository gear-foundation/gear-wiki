---
sidebar_position: 2
sidebar_label: Meta CLI
---

# Gear Meta CLI

CLI tool to encode/decode payloads and work with .meta.wasm files.

## Installation

```sh
npm install -g @gear-js/gear-meta
```

or

```sh
yarn global add @gear-js/gear-meta
```

## Usage

### Full list of commmands

```sh
gear-meta --help
```

### Available commands

**decode** - _Decode payload from hex_

**encode** - _Encode payload to hex_

**meta** - _Display metadata from .meta.wasm_

**type** - _Display type structure for particular type from .meta.wasm_

You can simply run these commands and you will be prompted to enter the necessary data. Or you can specify data through options:

**-t, --type** - _Type to encode or decode the payload. If it is not specified you can select it later_

**-m, --meta** - _Path to .meta.wasm file with program's metadata_

**-o --output** - _Output JSON file. If it doesn't exist it will be created_

**-j --payloadFromJson** - _If need to take the payload from json_

All of these options are available for `decode` and `encode` commands
`-o --output` option is available for `meta` command
`-m, --meta` option is available for `type` command

## Examples

```sh
gear-meta encode '{"amount": 8, "currency": "GRT"}' -t init_input -m ./path/to/demo_meta.meta.wasm

# Output:
  # Result:
  # 0x080c475254
```

```sh
gear-meta decode '0x080c475254' -t init_input -m ./path/to/demo_meta.meta.wasm

# Output:
  # Result:
  # { amount: '8', currency: 'GRT' }
```

```sh
gear-meta type handle_input -m ./path/to/demo_meta.meta.wasm

# Output:
  # TypeName:  MessageIn
  # { id: { decimal: 'u64', hex: 'Bytes' } }
```

```sh
gear-meta meta ./path/to/demo_meta.meta.wasm

# Output:
  # Result:
  # {
  #   types: '0x50000824646...0000023800',
  #   init_input: 'MessageInitIn',
  #   init_output: 'MessageInitOut',
  #   async_init_input: 'MessageInitAsyncIn',
  #   async_init_output: 'MessageInitAsyncOut',
  #   handle_input: 'MessageIn',
  #   handle_output: 'MessageOut',
  #   async_handle_input: 'MessageHandleAsyncIn',
  #   async_handle_output: 'MessageHandleAsyncOut',
  #   title: 'Example program with metadata',
  #   meta_state_input: 'Option<Id>',
  #   meta_state_output: 'Vec<Wallet>',
  #   meta_state: undefined
  # }
```
