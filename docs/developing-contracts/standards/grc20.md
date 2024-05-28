---
sidebar_label: GRC-20
sidebar_position: 1
---

# Gear Fungible Token Standard (GRC-20)

The Gear Fungible Token Standard provides a unified API for smart contracts to implement token functionalities. It encompasses critical operations like token transfer and approvals for third-party spending on the blockchain. Below, we detail the contract state, its interface, and key methods to facilitate these operations.

An example implementation of the GRC-20 standard is available on [GitHub](https://github.com/gear-foundation/standards/tree/master/gear-erc20).

## Contract State Definition

```rust
pub struct FungibleTokenData {
    /// Name of the token.
    name: String,
    /// Symbol of the token.
    symbol: String,
    /// Number of decimal places for the token.
    decimals: u8,
    /// Total supply of the token.
    total_supply: u128,
    /// Mapping of account addresses to their token balances.
    balances: HashMap<ActorId, u128>,
    /// Nested mapping for managing allowances: account -> (spender -> allowance).
    allowances: HashMap<ActorId, HashMap<ActorId, u128>>,
	/// Mapping of executed transactions to the time they are valid.
    tx_ids: HashMap<(ActorId, TxId), ValidUntil>,
    /// Mapping of accounts to their transaction IDs.
    account_to_tx_ids: HashMap<ActorId, HashSet<TxIds>>,
    /// Configuration parameters for the fungible token contract.
    config: Config,
}
```

### Key Components

- `name`: The token's name.
- `symbol`: The token's symbol.
- `decimals`: The precision of the token, indicating how it can be divided.
- `total_supply`: The total number of tokens that have been issued.
- `balances`: A map (HashMap) that records the token balance (u128) of each holder.
- `allowances`: A map that records how much an authorized spender is allowed to transfer from a user's account.
- `tx_ids`: A map of executed transactions to the time they are valid.
- `account_to_tx_ids`: A map of accounts and their successfully executed transaction ids.
- `config`: Contains configuration settings that can extend the smart contract with additional parameters defined by a contract developer. For example, it can include a transaction storage period and payment for transaction storage.
    ```rust
    Config { 
        /// transaction storage time
        tx_storage_period: u64,
        /// transaction storage cost 
        tx_payment: u128 
    }
    ```

## Contract Interface

The contract interface defines how users interact with the token contract, including token transfer, approval, and queries about balances, allowances, and other token information.

```rust
constructor {
  New : (name: str, symbol: str, decimals: u8);
};

service {
  Transfer : (tx_id: opt u64, from: actor_id, to: actor_id, amount: u128) -> result (Transferred, Error);
  Approve : (tx_id: opt u64, to: actor_id, amount: u128) -> result (Approved, Error);
  query Allowance : (spender: actor_id, account: actor_id) -> u128;
  query BalanceOf : (account: actor_id) -> u128;
  query Decimals : () -> u8;
  query GetTxValidityTime : (account: actor_id, tx_id: u64) -> opt u64;
  query Name : () -> str;
  query TotalSupply : () -> u128;
}

events {
    Transferred: struct { from: actor_id, to: actor_id, amount: u128 },
    Approved: struct { from: actor_id, to: actor_id, amount: u128 },
  }
}

type Error = enum {
  ZeroAddress,
  NotAllowedToTransfer,
  NotEnoughBalance,
  TxAlreadyExists,
};
```

## Key Methods

### `Transfer`

```rust
pub fn transfer(
        &mut self,
        tx_id: Option<TxId>,
        from: ActorId,
        to: ActorId,
        amount: u128,
    ) -> Result<Transferred> {}
```

Transfers a specified `amount` of tokens `from` one account `to` another. Upon successful execution generates the event:

```rust
Transferred {
    from,
    to,
    amount
}
```

The contract must return errors in the following cases:

- If `from` or `to` are zero addresses, then the error `ZeroAddress` is returned.
- If the `from` account does not have the specified balance, then the error `NotEnoughBalance` is returned.
- If the account sending the message is not the `from` account and it checks whether this account was approved to transfer tokens `from` the from account. If not approved, or if the specified amount is less than the amount of tokens that can be transferred, then the error `NotAllowedToTransfer` is returned.
- If `tx_id` is specified and a transaction from the account that sent this message has been executed with the specified ID, then the error `TxAlreadyExists` is returned.

### `Approve`

```rust
pub fn approve(&mut self, tx_id: Option<TxId>, to: ActorId, amount: u128) 
-> Result<Approved> {}
```

This function allows a designated spender (`to`) to withdraw up to an `amount` of tokens from your account, multiple times up to the amount limit. Resets allowance to `amount` with a subsequent call.

Upon successful execution, triggers the event:

```rust
pub struct Approved {
    from,
    to,
    amount,
}
```

The contract must return errors in the following cases:

- If the `to` address is a zero address, then the error `ZeroAddress` is returned.
- If `tx_id` is specified, the system checks whether a transaction from the sending account has already been executed with the given ID. If such a transaction exists, then the error `TxAlreadyExists` is returned.

:::important
In both methods, the user has the option to include a transaction ID, which serves for transaction identification and ensures idempotency. Including this ID is recommended when the transfer message originates from another contract. The `tx_id` helps prevent transaction duplication and aids in synchronizing the states of contracts in the event of a network failure.
:::

### `Mint`/`Burn`

:::note
These are the optional methods that can alter the total supply of tokens; they should be securely managed and controlled.
:::

When implementing `mint/burn` methods, the optional field `tx_id` can also be used. The `mint/burn` methods trigger the event:

```rust
Transferred {
    from,
    to,
    amount
}
```
Where:
- `from` is a zero address for `mint` method
- `to` is a zero address for `burn` method

## Query methods

Provide access to token information such as `name`, `symbol`, `decimals`, `total_supply`, and specific account balances and `allowance`s.

### `name`

Returns the name of the token.

```rust
pub fn name(&self) -> String {}
```

### `symbol`

Returns the symbol of the token.

```rust
pub fn symbol(&self) -> String {}
```

### `decimals`

Returns the decimals of the token.

```rust
pub fn decimals(&self) -> u8 {}
```

### `total_supply`

Returns the total supply of the token.

```rust
pub fn total_supply(&self) -> u128 {}
```

### `balance_of`

Returns the token balance of the `account` address.

```rust
pub fn balance_of(&self, account: ActorId) -> u128 {}
```

### `allowance`

Returns the number of tokens the `spender` account is authorized to spend on behalf of the `account`.

```rust
pub fn allowance(&self, spender: ActorId, account: ActorId) -> u128 {}
```

### `get_tx_validity_time`

Returns the validity period of the transaction. If the transaction does not exist, it returns `None`.

```rust
pub fn get_tx_validity_time(&self, account: ActorId, tx_id: TxId) 
-> Option<ValidUntil> {}
```

## Additional features and Considerations

- The contract can be expanded to include admin addresses and add functionalities such as minting and burning tokens.
- Storing completed transactions consumes storage space. `Transaction storage fee`s may be implemented to manage the cost of storing transaction data in VARA tokens. The contract owner can charge a fee for storing transactions in VARA tokens and refund it as transactions are cleared.
- Transactions can be cleared in the following ways:
    - An account can send a message to clear its transactions.
    - Any account can send a message to clear transactions that have been stored in the contract for longer than `transaction_storage_time` and receive a reward (at the admin's discretion).
    - The contract can check for the presence of transactions in an account each time an account sends a message, specifying `tx_id` and clearing outdated transactions.


## Conclusion 

By adhering to this standard, smart contracts can ensure interoperability and provide a consistent user experience across different platforms and applications within the blockchain ecosystem.

Using this standard, dApp developers can ensure that their in-app tokens, built on the basis of this standard, will be natively displayed in user wallets without requiring additional integration efforts, assuming that wallet applications also support this standard.