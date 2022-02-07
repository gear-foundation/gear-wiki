---
sidebar_label: Interactions between programs
sidebar_position: 4
---
# Cross-contracts calls
Let's create two simple contracts:
- `My Token` this contract will have the ability to mint tokens
-  `Wallet` this contracts will store how many tokens a user has
### `My Token` contract
Let's start by defining the contract struct:
```rust
#[derive(Debug, Default, Encode, Decode, TypeInfo)]
pub struct MyToken {
    name: String,
    symbol: String,
    balances: BTreeMap<ActorId, u128>,
}
```
It stores `name`, `symbol` and `balances` of accounts. Then we define `input` and `output` message types for `init` and `handle`. The contract will be initialized with the following struct:

```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub struct InitConfig {
    name: String,
    symbol: String,
}
```
The incoming messages will call contract for minting tokens or request an account balance:
```rust
#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum Action {
    Mint(u128),
    BalanceOf(ActorId),
}
```
The outcoming messages will either report a successful mint or the user's balance:
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
It is necessary to define the message types in `metadata!` macro that serves for exporting functions from Rust:
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
Note that here we use `msg::source()` that identifies the account that sends the currently processing message.
### `Wallet` contract
That contract is very simple: it accepts the message `AddBalance` and replies with `BalanceAdded`. 
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
 Since an account can have several different fungible tokens, the contract stores users balances in the following way:
 ```rust
static mut WALLET: BTreeMap<ActorId, BTreeMap<ActorId,u128>> = BTreeMap::new();
#[no_mangle]
pub unsafe extern "C" fn init() {}
 ```
The `Wallet` sends the message to the `MyToken` contract asking for the user balance. The address of the token contract is indicated in `AddBalance`. Note that here we use the async messaging function `send_and_wait_for_reply`, so `#[gstd::async_main]` macro must be used.
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
