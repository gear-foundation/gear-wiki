---
sidebar_position: 2
sidebar_label: Meta CLI
---

# Gear Meta CLI

CLI 工具，对参数进行编码/解码，并对 `.meta.wasm` 文件进行处理。

## 安装

```sh
npm install -g @gear-js/gear-meta
```

或

```sh
yarn global add @gear-js/gear-meta
```

## 用法

### 完整的命令列表

```sh
gear-meta --help
```

### 可用命令

**decode** - _解析 16 进制的 payload_

**encode** - _将 payload 编码为 16 进制数据_

**meta** - _从.meta.wasm 显示 metadata_

**type** - _显示来自 .meta.wasm 的特定类型的类型结构_

你可以运行这些命令的简写模式，系统会提示你输入必要的数据。或者你可以通过选项指定数据：

**-t, --type** - _Type to encode or decode the payload. If it is not specified you can select it later_

**-m, --meta** - _ .meta.wasm 文件的路径_

**-o --output** - _输出 JSON 文件。如果它不存在，将会创建_

**-j --payloadFromJson** - _如果需要从 json 中获取有效载荷_
_

所有这些选项都适用于 `decode` "和`encode`命令
`-o --output` 选项可用于 `meta` 命令
`-m, --meta` 选项可用于 `type` 命令

## 例子

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
