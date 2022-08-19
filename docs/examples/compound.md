---
sidebar_label: Compound
sidebar_position: 18
---

# Compound

## Introduction
Сompound - DeFi in which every user can place crypto assets, as well as borrow funds.

## Contract description

### Initialization
Contract initialized with:
```rust 
pub struct CompoundInit {
    pub token_address: ActorId,  // address of token contract
    pub ctoken_address: ActorId, // address of ctoken contract
    pub owner_address: ActorId,  // contract owner address
    pub ctoken_rate: u128,       // token cost * `ctoken_rate` = ctoken cost
    pub interest_rate: u128,     // user will earn `interest_rate` percent of his asset
    pub collateral_factor: u128, // user can borrow callateral * `collateral_factor`
    pub borrow_rate: u128,       // user will have to pay borrowed amount * `borrow_rate`
}
```

### Logic
Each user can lend tokens with `LendTokens { amount }`, borrow with `BorrowTokens { amount }` and redeem with `RedeemTokens { amount }`.

1. User can lend some `amount` of `tokens` if his balance is greater or equal to the `amount`. User receives in return `ctokens` according to the `ctoken_rate`
2. User can borrow some `amount` of `tokens` if he has lent at least `lend_amount` which is not less than `amount` / `collateral_factor`
3. User can redeem lend assets and some amount of borrowed payments only if expression `total_lend` * `collateral_factor` >= `total_borrowed` will be true

All payments are stored in `BTreeMap<ActorId, BTreeSet<Payment>>` and in `redeem` user picks payments he wants to refund and deposits he wants to redeem  

### Structs
```rust
struct Compound {
    token_address: ActorId,  // address of token contract
    ctoken_address: ActorId, // address of ctoken contract
    owner_address: ActorId,  // contract owner address
    lend_data: LendData,     // info realted to lend tokens
    borrow_data: BorrowData, // info realted to borrow tokens
    user_deposits: BTreeMap<ActorId, BTreeSet<Payment>>, // map of address -> lend payment
    user_borrows: BTreeMap<ActorId, BTreeSet<Payment>>,  // map of address -> borrow payment
    user_assets: BTreeMap<ActorId, (u128, u128)>, // total lent and borrowed tokens number for each user
    init_time: u64, // compound init time
}

pub struct LendData {
    pub ctoken_rate: u128,    // token cost * `ctoken_rate` = Ctoken cost
    pub interest_rate: u128,  // user will earn `interest_rate` percent asset
    pub max_deposit_id: u128, // id of the last lend
}

pub struct BorrowData {
    pub collateral_factor: u128, // user can borrow callateral * `collateral_factor`
    pub borrow_rate: u128,       // user will have to pay borrowed amount * `borrow_rate`
    pub max_borrow_id: u128,     // id of the last borrow
}

pub struct Payment {
    pub amount: u128,         // how much tokens in the lend/borrow
    pub ctokens_amount: u128, // 0 if payment is borrow, otherwise how much ctokens got for lending
    pub interest_rate: u128,  // `interest_rate` or `borrow_rate`
    pub payment_time: u64,    // timestamp when payment was made
    pub id: u128,             // payment id 
}

impl Payment {
    // returns how amount increased 
    pub fn count_interest(&self, amount: u128, time_now: u64) -> u128; 
}

impl Compound {
    // `msg::source` lend `amount` of tokens
    pub async fn lend_tokens(&mut self, amount: u128); 
    
    // `msg::source` borrow `amount` of tokens
    pub async fn borrow_tokens(&mut self, amount: u128); 
    
    // `msg::source` redeems tokens with ids in `lend_to_redeem` and refunds borrows in `amount_per_borrow`
    pub async fn redeem_tokens(
        &mut self,
        lend_to_redeem: BTreeSet<u128>,
        amount_per_borrow: BTreeMap<u128, u128>,
    );
    
    // returns is redeem posible with those params
    fn redeem_posible(
        &self,
        user: ActorId,
        lend_to_redeem: &BTreeSet<u128>,
        amount_per_borrow: &BTreeMap<u128, u128>,
    ) -> bool;
    
    // add payment to `container`
    fn insert_payment(
        address: ActorId,
        container: &mut BTreeMap<ActorId, BTreeSet<Payment>>,
        payment: &mut Payment,
    );
    
    // delete all payments where amount = 0
    fn delete_payments(&mut self, user_address: ActorId);
    
    // count how much ctokens corresponds to `tokens_amount`
    fn count_ctokens(&mut self, tokens_amount: u128) -> u128;
    
    // count how much tokens corresponds to `ctokens_amount`
    fn count_tokens(&mut self, ctokens_amount: u128) -> u128;
    
    // returns current `tokens` -> `ctokens` rate
    fn get_current_rate(_init_time: u64, ctoken_rate: u128) -> u128;
}
```

### Functions
```rust
    // Lend `amount` of tokens
    // Called with `CompoundAction::LendTokens`
    //
    // Requirements:
    // `amount` must be greater than zero
    //
    // Replies with `CompoundEvent::TokensLended` 
    pub async fn lend_tokens(&mut self, amount: u128); 
    
    // Borrow `amount` of tokens 
    // Called with `CompoundAction::BorrowTokens`
    //
    // Requirements:
    // `amount` must be greater than zero
    //
    // Replies with `CompoundEvent::TokensBorrowed` 
    pub async fn borrow_tokens(&mut self, amount: u128); 
    
    // Redeem lend deposits with ids in `lend_to_redeem` and borrows with ids in `amount_per_borrow` keys where value is amount
    // Called with `CompoundAction::RedeemTokens`
    //
    // Replies with `CompoundEvent::TokensRedeemed` 
    pub async fn redeem_tokens(
        &mut self,
        lend_to_redeem: BTreeSet<u128>,
        amount_per_borrow: BTreeMap<u128, u128>,
    );
```

### Actions and events
This action and event corresponds to the lend_tokens function
```rust
    CompoundAction::LendTokens {
        amount: u128,
    },
    CompoundEvent::TokensLended {
        address: ActorId,
        amount: u128,
        ctokens_amount: u128,
        interest_rate: u128,
        deposit_id: u128,
    },
```

This action and event corresponds to the borrow_tokens function 
```rust
    CompoundEvent::TokensBorrowed {
        address: ActorId,
        amount: u128,
        borrow_rate: u128,
        borrow_id: u128,
    },
    CompoundAction::BorrowTokens {
        amount: u128,
    },
```

This action and event corresponds to the redeem_tokens function
```rust
    CompoundEvent::TokensRedeemed {
        address: ActorId,
        redeemed_deposits: BTreeSet<Payment>,
        redeem_borrowed: BTreeMap<u128, Payment>,
    },
    CompoundAction::RedeemTokens {
        lend_to_redeem: BTreeSet<u128>,
        amount_per_borrow: BTreeMap<u128, u128>,
    },
```

## Conclusion
A source code of the contract example provided by Gear is available on GitHub: [`compound/src/lib.rs`](https://github.com/gear-dapps/compound/blob/master/src/lib.rs).

See also an example of the smart contract testing implementation based on gtest: [`concert/tests/`](https://github.com/gear-dapps/compound/blob/master/tests/).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/developing-contracts/testing).
