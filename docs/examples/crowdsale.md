---
sidebar_label: Crowdsale smart contract mechanics
sidebar_position: 18
---

# Crowdsale smart contract mechanics

## Introduction

A public offering to invest in a brand-new cryptocurrency or other digital asset is known as a cryptocurrency Crowdsale. A crowdsale can be used by new projects to raise money for development and other purposes. It is a time-limited campaign where investors can exchange their cryptocurrencies defined in the campaign to newly proposed tokens. The new tokens are promoted as future functional units after the crowdsale's funding goal is met and the project launches.

An example of a crowdsale smart-contract implementation described in this article is one of many other decentralized applications that can be implemented and laucnhed on Gear. This article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own crowdsale application and run it on the Gear Network.

Initial funds with which a token is purchased are determined by the Gear fungible tokens contract - [gFT](https://wiki.gear-tech.io/examples/gft-20). The contract's source code is available on [GitHub](https://github.com/gear-dapps/crowdsale).

## Interface
### Source files
1. `messages.rs` - contains function of the fungible token contract. Crowdsale contract interacts with fungible token contract through transfer_tokens function:
```rust
pub async fn transfer_tokens(
    token_id: &ActorId, // - the fungible token contract address
    from: &ActorId, // - the sender address
    to: &ActorId, // - the recipient address
    amount: u128, // - the amount of tokens
) 
```
This function sends a message (the action is defined in the enum IcoAction) and gets a reply (the reply is defined in the enum IcoEvent):
```rust
let _transfer_response = msg::send_for_reply(
    *token_id,
    FTAction::Transfer {
        from: *from,
        to: *to,
        amount,
    },
    0,
)
.expect("Error in message")
.await
.expect("Error in transfer");
```

2. `asserts.rs` - contains asserts functions: `owner_message` and `not_zero_address`. 
- `owner_message` checks if `msg::source()` is equal to `owner`. Otherwise, it panics:
```rust
pub fn owner_message(owner: &ActorId, message: &str) {
    if msg::source() != *owner {
        panic!("{}: Not owner message", message)
    }
}
```
- `not_zero_address` checks if `address` is not equal to `ZERO_ID`. Otherwise, it panics:
```rust
pub fn not_zero_address(address: &ActorId, message: &str) {
    if address == &ZERO_ID {
        panic!("{}: Zero address", message)
    }
}
```

3. `lib.rs` - defines the contract logic.

### Structs
The contract has the following structs:
```rust
struct IcoContract {
    ico_state: IcoState,
    start_price: u128,
    price_increase_step: u128,
    time_increase_step: u128,
    tokens_sold: u128,
    tokens_goal: u128,
    owner: ActorId,
    token_address: ActorId,
    token_holders: BTreeMap<ActorId, u128>,
}
```
where:
- `ico_state` is `IcoState` struct which consists of:
```rust
pub struct IcoState {
    pub ico_started: bool, // true if ICO was started
    pub start_time: u64, // time when ICO was started, otherwise is zero
    pub duration: u64, // duration of the ICO, otherwise is zero
    pub ico_ended: bool, // true if ICO was ended
}
```
- `start_price` - initial price of tokens
- `price_increase_step` - how much does the price increase
- `time_increase_step` - the period of time after which the price increases
- `tokens_sold` - how many tokens were sold
- `tokens_goal` - how many tokens are we going to sell
- `owner` - contract owner
- `token_address` - fungible token address 
- `token_holders` - the list of buyers and the number of tokens they bought

### Functions
- Starts the ICO. Only owner can call it:
```rust
async fn start_ico(&mut self, config: IcoAction)
```
replies with:
```rust
IcoEvent::SaleStarted {
    duration,
    start_price,
    tokens_goal,
    price_increase_step,
    time_increase_step,
},
```

- Purchase of tokens. Anyone with enough balance can call and buy tokens:
```rust
pub fn buy_tokens(&mut self, tokens_cnt: u128)
```
replies with:
```rust
IcoEvent::Bought {
    buyer,
    amount,
    change,
}
```

- Ends the ICO. Only owner can call it:
```rust
async fn end_sale(&mut self)
```
replies with:
```rust
IcoEvent::SaleEnded
```

## Conclusion

The source code of this example of ICO smart contract and the example of an implementation of its testing is available on [Github](https://github.com/gear-dapps/crowdsale).

For more details about testing smart contracts written on Gear, refer to the [Program Testing](https://wiki.gear-tech.io/developing-contracts/testing) article.
