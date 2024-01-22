---
sidebar_label: Crowdsale program mechanics
sidebar_position: 6
---

# Crowdsale program mechanics

## Introduction

A public offering to help build brand-new cryptocurrency or other digital assets through crowd contributions is known as a cryptocurrency crowdsale. A crowdsale can be used by new projects to mobilize resources for development and other purposes. It is a time-limited campaign during which crypto owners can exchange their cryptocurrencies for newly proposed tokens, as defined in the campaign. These new tokens are promoted as future functional units once the crowdsale's goal is met and the project launches.

The example of a crowdsale program implementation described in this article is just one of many decentralized applications that can be implemented and launched on Gear. This article explains the programming interface, data structure, basic functions and their purposes. You can use it as-is or modify it to suit your scenarios. Anyone can easily create their crowdsale application and run it on a Gear-powered network.

The initial resources used to acquire tokens are determined by the Gear fungible tokens contract - [gFT](../Standards/gft-20). The program's source code is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/crowdsale).

## Interface
### Source files
1. `messages.rs` - contains function of the fungible token contract. Crowdsale program interacts with the fungible token contract through `transfer_tokens` function:
```rust title="crowdsale/src/messages.rs"
pub async fn transfer_tokens(
    transaction_id: u64,
    token_address: &ActorId,
    from: &ActorId,
    to: &ActorId,
    amount_tokens: u128,
) -> Result<(), ()>
```
- `transaction_id` - identifier of the associated transaction
- `from` is the sender's accounts
- `to` is recipient account
- `amount` is number of tokens

This function sends a message (the action is defined in the enum IcoAction) and gets a reply (the reply is defined in the enum IcoEvent):
```rust title="crowdsale/src/messages.rs"
let reply = msg::send_for_reply_as::<FTokenAction, FTokenEvent>(
        *token_address,
        FTokenAction::Message {
            transaction_id,
            payload: LogicAction::Transfer {
                sender: *from,
                recipient: *to,
                amount: amount_tokens,
            },
        },
        0,
        0,
    )
    .expect("Error in sending a message `FTokenAction::Message`")
    .await;

match reply {
    Ok(FTokenEvent::Ok) => Ok(()),
    _ => Err(()),
}
```

2. `asserts.rs` - contains asserts functions: `owner_message` and `not_zero_address`.
- `owner_message` checks if `msg::source()` is equal to `owner`. Otherwise, it panics:
```rust title="crowdsale/src/asserts.rs"
pub fn owner_message(owner: &ActorId, message: &str) {
    if msg::source() != *owner {
        panic!("{}: Not owner message", message)
    }
}
```
- `not_zero_address` checks if `address` is not equal to `ZERO_ID`. Otherwise, it panics:
```rust title="crowdsale/src/asserts.rs"
pub fn not_zero_address(address: &ActorId, message: &str) {
    if address == &ZERO_ID {
        panic!("{}: Zero address", message)
    }
}
```

3. `lib.rs` - defines the program logic.

### Structs

The program has the following structs:
```rust title="crowdsale/src/lib.rs"
struct IcoContract {
    ico_state: IcoState,
    start_price: u128,
    price_increase_step: u128,
    time_increase_step: u128,
    tokens_sold: u128,
    tokens_goal: u128,
    owner: ActorId,
    token_address: ActorId,
    token_holders: HashMap<ActorId, u128>,
    transaction_id: u64,
    transactions: HashMap<ActorId, u64>,
}
```
where:
- `ico_state` is `IcoState` struct which consists of:
```rust title="crowdsale/io/src/lib.rs"
pub struct IcoState {
    pub ico_started: bool, // true if ICO was started
    pub start_time: u64,   // time when ICO was started, otherwise is zero
    pub duration: u64,     // duration of the ICO, otherwise is zero
    pub ico_ended: bool,   // true if ICO was ended
}
```
- `start_price` - initial price of tokens
- `price_increase_step` - how much does the price increase
- `time_increase_step` - the period of time after which the price increases
- `tokens_sold` - how many tokens were sold
- `tokens_goal` - how many tokens are we going to sell
- `owner` - program owner
- `token_address` - fungible token address
- `token_holders` - the list of buyers and the number of tokens they bought

### Functions
- Starts the ICO. Only owner can call it:
```rust title="crowdsale/src/lib.rs"
async fn start_ico(&mut self, config: IcoAction)
```
replies with:
```rust title="crowdsale/src/lib.rs"
IcoEvent::SaleStarted {
    transaction_id: current_transaction_id,
    duration,
    start_price,
    tokens_goal,
    price_increase_step,
    time_increase_step,
}
```

- Purchase of tokens. Anyone with enough balance can call and buy tokens:
```rust title="crowdsale/src/lib.rs"
pub fn buy_tokens(&mut self, tokens_cnt: u128)
```
replies with:
```rust title="crowdsale/src/lib.rs"
IcoEvent::Bought {
    buyer: msg::source(),
    amount: tokens_cnt,
    change,
}
```

- Ends the ICO. Only owner can call it:
```rust title="crowdsale/src/lib.rs"
async fn end_sale(&mut self)
```
replies with:
```rust title="crowdsale/src/lib.rs"
IcoEvent::SaleEnded(current_transaction_id)
```

### Programm metadata and state
Metadata interface description:

```rust title="crowdsale/io/src/lib.rs"
pub struct CrowdsaleMetadata;

impl Metadata for CrowdsaleMetadata {
    type Init = In<IcoInit>;
    type Handle = InOut<IcoAction, IcoEvent>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = Out<State>;
}
```
To display the full program state information, the `state()` function is used:

```rust title="crowdsale/src/lib.rs"
#[no_mangle]
extern fn state() {
    let staking = unsafe {
        ICO_CONTRACT
            .take()
            .expect("Unexpected error in taking state")
    };
    msg::reply::<State>(staking.into(), 0)
        .expect("Failed to encode or reply with `State` from `state()`");
}
```
To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `State` state. For example - [gear-foundation/dapps/crowdsale/state](https://github.com/gear-foundation/dapps/tree/master/contracts/crowdsale/state):

```rust title="crowdsale/state/src/lib.rs"
#[gmeta::metawasm]
pub mod metafns {
    pub type State = crowdsale_io::State;

    pub fn current_price(state: State) -> u128 {
        state.get_current_price()
    }

    pub fn tokens_left(state: State) -> u128 {
        state.get_balance()
    }

    pub fn balance_of(state: State, address: ActorId) -> u128 {
        state.balance_of(&address)
    }
}
```

## Conclusion

The source code of this example of ICO program and the example of an implementation of its testing is available on [Github](https://github.com/gear-foundation/dapps/tree/master/contracts/crowdsale).

For more details about testing programs written on Gear, refer to the [Program Testing](https://wiki.gear-tech.io/developing-contracts/testing) article.
