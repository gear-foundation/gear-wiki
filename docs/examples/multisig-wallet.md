---
sidebar_label: Multisig Wallet
sidebar_position: 11
---

# Multisig Wallet

## Introduction
Multisignature wallets are cryptocurrency wallets that require one or more private keys to sign and send a transaction.

Imagine a bank vault that requires more than one key to open: That’s a little how multisignature cryptocurrency wallets work.

Multisignature proponents argue that multisignature is the most secure and fail-proof way to store cryptocurrency. Even if a thief gets his hands on one of your wallets, for example, they still won’t be able to access your account without the keys to the other wallets in the setup.

This article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own application and run it on the Gear Network. The source code is available on [GitHub](https://github.com/gear-dapps/multisig-wallet). 

## Logic

Wallet is owned by one or more owners, and in order for something significant to take place required count of owners should confirm this action.

Deployer of a contract can choose how many owners are allowed to send transaction from the wallet as well as the minimum number of owners needed to send it (e.g., you could have a 2-of-3 multisig where two out of three assigned private keys are needed, 3-of-5, 5-of-7, etc.).

To send a transaction through multisig wallet one of the owners should send transaction to the wallet with a `SubmitTransaction` action in the payload, and other owners should approve this transaction by `ConfirmTransaction` action until the required amount is reached.

In the description of the transaction owner can add some useful information about it.

The wallet is flexible and users can manage the list of owners and the number of confirmations required.

>Of course, we took care of the security of the contract, so adding an owner, removing an owner, replacing an owner and changing required confirmations count can only be done with required confirmations from other owners.

The transaction approval logic is complex, for example:
1. If the owner submits the transaction and the contract only needs one confirmation to execute the transaction, the contract will firstly add the transaction to the storage, then confirm it by the submitting owner, then execute transaction automatically.
2. If the owner submits the transaction and the contract needs two or more confirmations to execute the transaction, the contract will firstly add the transaction to the storage, then confirm it by the submitting owner. And to execute this transaction wallet will steel need one or more confirmations. Then another owner send `ConfirmTransaction` action to the contract and if everything is fine, the transaction will be executed automatically

> In most cases a transaction will execute automatically after all confirmations is done. But there is a corner case, if the transaction was confirmed `n` times, and the contract requires `n + 1` or more confirmations, and then the owners change the required confirmations count to `n` or less, owners can either wait for the next confirmation, or simply call `ExecuteTransaction` with corresponding transaction ID to execute it

## Interface

### Init Config
```rust
pub struct MWInitConfig {
    pub owners: Vec<ActorId>,
    pub required: u64,
}
```

Describes initial state of the wallet.
- `owners` - a list of owners of a new wallet
- `required` - a required confirmations count to approve and execute transaction

### Actions

```rust
pub enum MWAction {
    AddOwner(ActorId),
    RemoveOwner(ActorId),
    ReplaceOwner {
        old_owner: ActorId,
        new_owner: ActorId,
    },
    ChangeRequiredConfirmationsCount(u64),
    SubmitTransaction {
        destination: ActorId,
        data: Vec<u8>,
        value: u128,
        description: Option<String>
    },
    ConfirmTransaction(U256),
    RevokeConfirmation(U256),
    ExecuteTransaction(U256),
}
```

- `AddOwner` is an action to add a new owner. Action has to be used through `SubmitTransaction`.
- `RemoveOwner` is an action to remove an owner. Action has to be used through `SubmitTransaction`.
- `ReplaceOwner` is an action to replace an owner with a new owner. Action has to be used through `SubmitTransaction`.
- `ChangeRequiredConfirmationsCount` is an action to change the number of required confirmations. Action has to be used through `SubmitTransaction`.
- `SubmitTransaction` is an action that allows an owner to submit and automatically confirm a transaction.
- `ConfirmTransaction` is an action that allows an owner to confirm a transaction. If this is the last confirmation, the transaction is automatically executed.
- `RevokeConfirmation` is an action that allows an owner to revoke a confirmation for a transaction.
- `ExecuteTransaction` is an action that allows anyone to execute a confirmed transaction.

### Events

```rust
pub enum MWEvent {
    Confirmation {
        sender: ActorId,
        transaction_id: U256,
    },
    Revocation {
        sender: ActorId,
        transaction_id: U256,
    },
    Submission {
        transaction_id: U256,
    },
    Execution {
        transaction_id: U256,
    },
    OwnerAddition {
        owner: ActorId,
    },
    OwnerRemoval {
        owner: ActorId,
    },
    OwnerReplace {
        old_owner: ActorId,
        new_owner: ActorId,
    },
    RequirementChange(U256),
}
```

- `Confirmation` is an event that occurs when someone use `ConfirmTransaction` action successfully
- `Revocation` is an event that occurs when someone use `RevokeConfirmation` action successfully
- `Submission` is an event that occurs when someone use `SubmitTransaction` action successfully
- `Execution` is an event that occurs when someone use `ExecuteTransaction` action successfully
- `OwnerAddition` is an event that occurs when the wallet use `AddOwner` action successfully
- `OwnerRemoval` is an event that occurs when the wallet use `RemoveOwner` action successfully
- `OwnerReplace` is an event that occurs when the wallet use `ReplaceOwner` action successfully
- `RequirementChange` is an event that occurs when the wallet use `ChangeRequiredConfirmationsCount` action successfully

### State

*Requests:*

```rust
pub enum State {
    ConfirmationsCount(U256),
    TransactionsCount {
        pending: bool,
        executed: bool,
    },
    Owners,
    Confirmations(U256),
    TransactionIds {
        from_index: u64,
        to_index: u64,
        pending: bool,
        executed: bool,
    },
    IsConfirmed(U256),
    Description(U256)
}
```

- `ConfirmationsCount` returns number of confirmations of a transaction whose ID is a parameter.
- `TransactionsCount` returns total number of transactions after filers are applied. `pending` includes transactions that have not been executed yet, `executed` includes transactions that have been completed
- `Owners` returns list of owners.
- `Confirmations` returns array with owner addresses, which confirmed transaction whose ID is a parameter.
- `TransactionIds` returns list of transaction IDs in defined range.
  - `from` index start position of transaction array.
  - `to` index end position of transaction array(not included).
  - `pending` include pending transactions.
  - `executed` include executed transactions.
- `IsConfirmed` returns the confirmation status of the transaction whose ID is a parameter.
- `Description` Returns the description of the transaction whose ID is a parameter.

Each state request has a corresponding reply with the same name.

*Replies:*

```rust
pub enum StateReply {
    ConfirmationCount(u64),
    TransactionsCount(u64),
    Owners(Vec<ActorId>),
    Confirmations(Vec<ActorId>),
    TransactionIds(Vec<U256>),
    IsConfirmed(bool),
    Description(Option<String>)
}
```

## Source code

The source code of this example of Multisig Wallet smart contract and the example of an implementation of its testing is available on [GitHub](https://github.com/gear-dapps/multisig-wallet).

See also an example of the smart contract testing implementation based on `gtest`: [multisig-wallet/tests](https://github.com/gear-dapps/multisig-wallet/tree/master/tests).

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/developing-contracts/testing) article.
