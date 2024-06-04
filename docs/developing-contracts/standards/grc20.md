---
sidebar_label: GRC-20
sidebar_position: 1
---

# Gear Fungible Token Standard (GRC-20)

The Gear Fungible Token Standard provides a unified API for smart contracts to implement token functionalities. It encompasses critical operations like token transfer and approvals for third-party spending on the blockchain. Below, we detail the contract state, its interface, and key methods to facilitate these operations.

An example implementation of the GRC-20 standard is available on [GitHub](https://github.com/gear-foundation/standards/tree/master/gear-erc20).

## Functions

```
  Approve(spender, value)
  Transfer(to, value)
  TransferFrom(from, to, value)
  Allowance(owner, spender)
  BalanceOf(owner) 
  Decimals()
  Name()
  Symbol()
  TotalSupply()

```

## Events

```
    Approval(owner, spender, value);
    Transfer(from, to, value);
```

## Key methods

### `Approve`

```rust
pub fn approve(&mut self, spender: sails_rtl::ActorId, value: U256) -> bool
```

This function allows a designated spender (`spender`) to withdraw up to an `value` of tokens from your account, multiple times up to the amount limit. Resets allowance to `value` with a subsequent call. Returns a boolean value indicating whether the operation succeeded.

Upon successful execution, triggers the event:

```rust
Approval {
    owner: sails_rtl::ActorId,
    spender: sails_rtl::ActorId,
    value: U256,
}
```

### `Transfer`

```rust
pub fn transfer(&mut self, to: sails_rtl::ActorId, value: U256) -> bool
```


Transfers the specified `value` of tokens to the account `to`. Returns a boolean value indicating whether the operation 

Upon successful execution generates the event:

```rust
Transfer {
    from: sails_rtl::ActorId,
    to: sails_rtl::ActorId,
    value: U256,
}
```

### `TransferFrom`

```rust
pub fn transfer_from(&mut self, from: sails_rtl::ActorId, to: sails_rtl::ActorId, value: U256) -> bool
```
Transfers a specified `value` of tokens `from` one account `to` another, using the allowance mechanism. Value is then deducted from the caller’s allowance. Returns a boolean value indicating whether the operation succeeded.

Upon successful execution generates the event:

```rust
Transfer {
    from: sails_rtl::ActorId,
    to: sails_rtl::ActorId,
    value: U256,
}
```

## Query methods

### `name`

Returns the name of the token.

```rust
pub fn name(&self) -> String 
```

### `symbol`

Returns the symbol of the token.

```rust
pub fn symbol(&self) -> String 
```

### `decimals`

Returns the decimals of the token.

```rust
pub fn decimals(&self) -> u8
```

### `total_supply`

Returns the total supply of the token.

```rust
pub fn total_supply(&self) -> U256
```

### `balance_of`

Returns the token balance of the `owner` address.

```rust
pub fn balance_of(&self, owner: sails_rtl::ActorId) -> U256
```

### `allowance`

Returns the number of tokens the `spender` account is authorized to spend on behalf of the `owner`.

```rust
pub fn allowance(&self, owner: sails_rtl::ActorId, spender: sails_rtl::ActorId) -> U256 
```

## Contract Interface

The contract interface defines how users interact with the token contract, including token transfer, approval, and queries about balances, allowances, and other token information.

```rust
constructor {
  New : (name: str, symbol: str, decimals: u8);
};

service Erc20 {
  Approve : (spender: actor_id, value: u256) -> bool;
  Transfer : (to: actor_id, value: u256) -> bool;
  TransferFrom : (from: actor_id, to: actor_id, value: u256) -> bool;
  query Allowance : (owner: actor_id, spender: actor_id) -> u256;
  query BalanceOf : (owner: actor_id) -> u256;
  query Decimals : () -> u8;
  query Name : () -> str;
  query Symbol : () -> str;
  query TotalSupply : () -> u256;

  events {
    Approval: struct { owner: actor_id, spender: actor_id, value: u256 };
    Transfer: struct { from: actor_id, to: actor_id, value: u256 };
  }
};
```

## Conclusion 

By adhering to this standard, smart contracts can ensure interoperability and provide a consistent user experience across different platforms and applications within the blockchain ecosystem.

Using this standard, dApp developers can ensure that their in-app tokens, built on the basis of this standard, will be natively displayed in user wallets without requiring additional integration efforts, assuming that wallet applications also support this standard.
