---
sidebar_label: 合约交互
sidebar_position: 4
---
# 跨合约通信

本文解释了几个程序（智能合约）如何通过发送消息进行相互通信。

以两个简单的程序为例:
- `My Token` - 该合约将有铸造代币的能力
-  `Wallet` - 该合约将存储用户拥有多少代币的信息

### `My Token` 合约

让我们开始编写合约 `My Token`，第一步是定义合约的结构来存储账户的 `name`, `symbol` 和 `balances`：

```rust
#[derive(Debug, Default, Encode, Decode, TypeInfo)]
pub struct MyToken {
    name: String,
    symbol: String,
    balances: BTreeMap<ActorId, u128>,
}
```

我们为合约初始化 `init` 和 消息处理 `handle` 定义了 `input` 和 `output` 两种消息类型。

- 合约将用以下结构初始化:

    ```rust
    #[derive(Debug, Encode, Decode, TypeInfo)]
    pub struct InitConfig {
        name: String,
        symbol: String,
    }
    ```
- 传入的消息将调用此合约以铸造代币或获取帐户余额:
    ```rust
    #[derive(Debug, Encode, Decode, TypeInfo)]
    pub enum Action {
        Mint(u128),
        BalanceOf(ActorId),
    }
    ```
- 回发消息将返回铸币成功的结果或用户的余额:
    ```rust
    #[derive(Debug, Encode, Decode, TypeInfo)]
    pub enum Event {
        Minted {
            to: ActorId,
            amount: u128,
        },
        BalanceOf(u128),
    }
    ```

必须在 `metadata!` 中定义消息类型，用于从 Rust 导出函数:
```rust
gstd::metadata! {
    title: "MyFungibleToken",
        init:
            input: InitConfig,
        handle:
            input: Action,
            output: Event,
}
```
下一步是写程序初始化:
```rust
static mut TOKEN: Option<MyToken> = None;
#[no_mangle]
pub unsafe extern "C" fn init() {
    let config: InitConfig= msg::load().expect("Unable to decode InitConfig");
    let token = MyToken {
        name: config.name,
        symbol: config.symbol,
        balances: BTreeMap::new(),
    };
    TOKEN = Some(token);
}
```
然后我们写对传入消息进行处理过程:
```rust
#[no_mangle]
pub unsafe extern "C" fn handle() {
    let action: Action = msg::load().expect("Could not load Action");
    let token: &mut MyToken = TOKEN.get_or_insert(MyToken::default());
    match action {
        Action::Mint(amount) => {
            token.mint(amount);
        }
        Action::BalanceOf(account)=> {
            token.balance_of(&account);
        }
    }
}
```
最终，我们写 `MyToken` 实现代码块:
```rust
impl MyToken {
    fn mint(&mut self, amount: u128) {
        *self.balances.entry(msg::source()).or_insert(0) += amount;
        msg::reply(
            Event::Minted {
                to: msg::source(),
                amount
            },
            exec::gas_available() - GAS_RESERVE,
            0,
        )
        .unwrap();
    }
    fn balance_of(&mut self, account: &ActorId) {
        let balance = self.balances.get(account).unwrap_or(&0);
        msg::reply(
            Event::Balance(*balance),
            exec::gas_available() - GAS_RESERVE,
            0,
        )
        .unwrap();
    }
}
```
请注意，这里我们使用 `msg::source()` 来标识发送当前正在处理的消息的帐户。

### `Wallet` 合约
第二个合约非常简单: 它会收到消息 `AddBalance`，并回复 `BalanceAdded`。
 ```rust
 #[derive(Debug, Encode, Decode, TypeInfo)]
pub struct AddBalance {
    account: ActorId,
    token_id: ActorId,
}
#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct BalanceAdded {
   account: ActorId,
   token_id: ActorId,
   amount: u128,
}
gstd::metadata! {
    title: "Wallet",
        handle:
            input: AddBalance,
            output: BalanceAdded,
}
 ```
 由于一个账户可以有多个不同的同质化代币，合同采用以下方式存储用户及其余额：
 ```rust
static mut WALLET: BTreeMap<ActorId, BTreeMap<ActorId,u128>> = BTreeMap::new();
#[no_mangle]
pub unsafe extern "C" fn init() {}
 ```
`Wallet` 合约向 `MyToken` 合约发送请求用户余额的消息。代币合约的地址显示在 `AddBalance` 中。

请注意，这里我们使用异步消息传递函数 `send_and_wait_for_reply`, 因此必须使用 `#[gstd::async_main]` 宏。
``` rust
#[gstd::async_main]
async fn main() {
    let msg: AddBalance = msg::load().expect("Failed to decode `AddBalance`");
    let reply: Event = msg::send_and_wait_for_reply(
        msg.token_id,
        Action::BalanceOf(msg.account),
        GAS_RESERVE,
        0,
    )
    .unwrap()
    .await
    .expect("Function call error");
    if let Event::Balance(amount) = reply{
        WALLET.entry(msg.account)
                .and_modify(|id| *id.entry(msg.token_id).or_insert(0) += amount)
                .or_insert_with(|| {
                        let mut a = BTreeMap::new();
                        a.insert(msg.token_id, amount);
                        a
                    }
                );
        msg::reply(
            BalanceAdded {
                account: msg.account,
                token_id: msg.token_id,
                amount,
            },
            exec::gas_available() - GAS_RESERVE,
            0,
        )
        .unwrap();
    }
}
 ```
