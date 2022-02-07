---
sidebar_label: Interaction Between Programs
sidebar_position: 4
---
# Cross-contract communication

This article explains how several programs (smart contracts) can communicate with each other by sending messages.

Two simple programs are taken as an example:
- `My Token` - this contract will have an ability to mint tokens
-  `Wallet` - this contract will store information about how many tokens the user has

### `My Token` contract

Let's write the contract `My Token` and the first step will be defining the contract struct that stores `name`, `symbol` and `balances` of accounts:

```rust
#[derive(Debug, Default, Encode, Decode, TypeInfo)]
pub struct MyToken {
    name: String,
    symbol: String,
    balances: BTreeMap<ActorId, u128>,
}
```

Then we define `input` and `output` message types for contract initialization `init` and message handling `handle`.

- The contract will be initialized with the following struct:

    ```rust
    #[derive(Debug, Encode, Decode, TypeInfo)]
    pub struct InitConfig {
        name: String,
        symbol: String,
    }
    ```
- The incoming messages will call this contract either for minting tokens or request an account balance:
    ```rust
    #[derive(Debug, Encode, Decode, TypeInfo)]
    pub enum Action {
        Mint(u128),
        BalanceOf(ActorId),
    }
    ```
- The outcoming messages will either report a successful mint or the user's balance:
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

It is necessary to define the message types in `metadata!` macro which is used to export functions from Rust:
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
The next step is to write the program initialization:
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
Then we write the processing of incoming messages:
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
And finally we write an implementation block for `MyToken`:
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
        );
    }
    fn balance_of(&mut self, account: &ActorId) {
        let balance = self.balances.get(account).unwrap_or(&0);
        msg::reply(
            Event::Balance(*balance),
            exec::gas_available() - GAS_RESERVE,
            0,
        );
    }
}
```
Note that here we use `msg::source()` which identifies the account that sends the current message being processed.

### `Wallet` contract
The second contract is very simple: it receives the message `AddBalance` and replies with `BalanceAdded`. 
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
 Since an account can have several different fungible tokens, the contract stores users and their balances in the following way:
 ```rust
static mut WALLET: BTreeMap<ActorId, BTreeMap<ActorId,u128>> = BTreeMap::new();
#[no_mangle]
pub unsafe extern "C" fn init() {}
 ```
The `Wallet` contract sends the message to the `MyToken` contract asking for the user balance. The address of the token contract is indicated in `AddBalance`. 

Note that here we use the async messaging function `send_and_wait_for_reply`, so `#[gstd::async_main]` macro must be used.
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
        );
    }
}
 ```
