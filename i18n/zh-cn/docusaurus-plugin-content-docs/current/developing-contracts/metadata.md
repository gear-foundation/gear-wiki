---
sidebar_label: 元数据
sidebar_position: 5
---

# 元数据

元数据是一种接口映射，有助于将一组字节转换为可理解的结构，并展示出该结构的用途。元数据决定了所有传入和传出数据的编码/解码方式。

元数据允许 dApp 的各个部分--智能合约和客户端（JavaScript）相互理解并交互数据。

要描述元数据接口，请使用 `gmeta`：

```rust
use gmeta::{InOut, Metadata};

pub struct ProgramMetadata;

// 一定要描述所有的类型。
// 但如果程序中缺少任一入口，请使用 () 代替；
// 如 `type Signal` 所示

impl Metadata for ProgramMetadata {
    type Init = InOut<MessageInitIn, MessageInitOut>;
    type Handle = InOut<MessageIn, MessageOut>;
    type Others = InOut<MessageAsyncIn, Option<u8>>;
    type Reply = String;
    type Signal = ();
    type State = Vec<Wallet>;
}
```

正如我们所看到的，元数据使你能够确定合约在每个端点的输入/输出的预期数据格式：

- `Init` - `init()` 函数的输入/输出类型。
- `Handle` -`handle()`函数的输入/输出类型。
- `Others`- 在异步交互的情况下，`main()`函数的输入/输出类型。
- `Reply` - 使用 `handle_reply` 函数执行的消息的输入/输出类型。
- `Signal` - 只描述在处理系统信号时从程序中输出的类型。
- `State` - 查询的状态的类型


## 生成元数据

要生成元数据，需要在项目文件夹的根目录下添加 `build.rs` 文件：

```rust
// build.rs
// Where ProgramMetadata is your metadata structure

use meta_io::ProgramMetadata;

fn main() {
    gear_wasm_builder::build_with_metadata::<ProgramMetadata>();
}
```

作为智能合约编译的结果，将生成一个 `meta.txt` 文件。这个元数据文件可用于与该智能合约互动的用户界面应用程序。文件的内容看起来像一个十六进制字符串：

```
01000000000103000000010500000001090000000102000000010d000000010f0000000111000000000112000000a9094c00083064656d6f5f6d6574615f696f344d657373616765496e6974496e0000080118616d6f756e74040108753800012063757272656e6379080118537472696e6700000400000503000800000502000c083064656d6f5f6d6574615f696f384d657373616765496e69744f7574000008013465786368616e67655f72617465100138526573756c743c75382c2075383e00010c73756d04010875380000100418526573756c740804540104044501040108084f6b040004000000000c457272040004000001000014083064656d6f5f6d6574615f696f244d657373616765496e000004010869641801084964000018083064656d6f5f6d6574615f696f084964000008011c646563696d616c1c010c75363400010c68657820011c5665633c75383e00001c000005060020000002040024083064656d6f5f6d6574615f696f284d6573736167654f7574000004010c7265732801384f7074696f6e3c57616c6c65743e00002804184f7074696f6e040454012c0108104e6f6e6500000010536f6d6504002c00000100002c083064656d6f5f6d6574615f696f1857616c6c6574000008010869641801084964000118706572736f6e300118506572736f6e000030083064656d6f5f6d6574615f696f18506572736f6e000008011c7375726e616d65080118537472696e670001106e616d65080118537472696e6700003400000238003800000504003c083064656d6f5f6d6574615f696f384d6573736167654173796e63496e0000040114656d707479400108282900004000000400004404184f7074696f6e04045401040108104e6f6e6500000010536f6d650400040000010000480000022c00
```

## 验证元数据

为了验证程序的元数据，可以使用`metahash()`函数。它允许在链上验证元数据。

```rust
#[no_mangle]
// It returns the Hash of metadata.
// .metahash is generating automatically while you are using build.rs
extern "C" fn metahash() {
    let metahash: [u8; 32] = include!("../.metahash");
    msg::reply(metahash, 0).expect("Failed to share metahash");
}
```
