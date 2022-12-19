---
sidebar_label: gFT (ERC-20)
sidebar_position: 3
---

# Gear Fungible Token

## What is ERC-20?

ERC-20 is a standard that’s used for creating and issuing smart contracts on the Ethereum blockchain. It was created by Ethereum developers on behalf of the Ethereum community in 2015, and it was officially recognized in 2017.

These smart contracts can then be used to create tokenized assets that represent anything on the Ethereum blockchain like:

- In-game currency

- Financial instruments like a share in a company

- Fiat currencies, like USD for example

- Ounces of Gold

These tokenized assets are known as fungible tokens as all instances of a given ERC-20 token are the same and they can be used interchangeably. A token that is unique and can not be interchangeable is known as a Non Fungible Token.

Gear provides native implementation of fungible token (gFT) described in this article. It explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own application and run it on the Gear Network. The source code is available on [GitHub](https://github.com/gear-dapps/sharded-fungible-token).

The implementation of fungible token includes the following contracts:
- The `master` fungible token that serves as a proxy program that redirects the message to the logic contract;
- The token `logic` contract that includes the realization of main standard token functions. The logic is placed in a separate contract in order to be able to add functions without losing the address of the fungible token and the contract state;
- The several `storage` contracts that store the balances of the users.

![img alt](./img/overall_ft_arch.png#gh-light-mode-only)
![img alt](./img/overall_ft_arch-dark.png#gh-dark-mode-only)

**Features**:
- `Preventing Duplicate Transaction (Maintaining idempotency)`.
There are two possible risks when sending a transaction: the risk of sending duplicate transactions and the risk of not knowing the status of the transaction due to a network failure. The sender can be assured that the transaction will only be executed once (`idempotency`).
- `Atomicity`.
Maintaining idempotency makes it possible to implement different protocols for distributed transactions. For example, Saga Protocol. The standard also includes a lock/execute transfer function that allows the implementation of the `2 Phase Commit protocol` (2 PC).

### Storage contract architecture
The storage contract state has the following fields:
- The address of the logic contract. The storage contract must execute messages received only from that address;

    ```rust
    ft_logic_id: ActorId
    ```
- The executed transactions. In each message the storage contract receives the hash of the transaction that is being executed and stores the result of its execution in the field `Executed`, which is necessary for maintaining `idempotency`. The field `Locked` serves for the transaction that is executed in 2 messages (for 2 phase commit protocol). If the transaction hash already exists in the state, the storage contract checks whether the transaction is two-phase. If it is, then it allows the execution, otherwise it replies with the result of the previous execution.

    ```rust
    transaction_status: HashMap<H256, (Executed, Locked)>
    ```
- Balances of accounts.

    ```rust
    balances: HashMap<ActorId, u128>
    ```
- Approvals of accounts.

    ```rust
    approvals: HashMap<ActorId, HashMap<ActorId, u128>>
    ```
The messages that the storage accepts:
- `Increase balance`: the storage increases the balance of the indicated account;
- `Decrease balance`: The storage decreases the balance of the indicated account;
- `Approve`: The storage allows the account to give another account an approval to transfer his tokens;
- `Transfer`: Transfer tokens from one account to another. The message is called from the logic contract when the token transfer occurs in one storage.
- `Clear`: Remove the hash of the executed transaction.

That storage contract doesn't make any asynchronous calls, so its execution is `atomic`.

### The logic contract architecture
The state of the logic contract consist of the following fields:
- The address of the master token contract. The logic contract must execute messages only from that address:

```rust
ftoken_id: ActorId
```
- The transactions. As in the storage contract, the logic contract receives the hash of the transaction that is being executed and stores the result of its execution. But unlike the storage contract, where message executions are atomic, the logic contract has to keep track of which message is being executed and what stage it is at.

  ```rust
  transactions: HashMap<H256, Transaction>
  ```
  The `Transaction` is the following struct:

    ```rust
    pub struct Transaction {
        msg_source: ActorId,
        operation: Operation,
        status: TransactionStatus,
    }
    ```
    Where `msg_source` is an account that sends a message to the main contract. `Operation` is the action that the logic contract should process and `status` is the transaction status. It is the following enum:

    ```rust
    pub enum TransactionStatus {
        InProgress,
        Success,
        DecreaseSuccess,
        Failure,
        Rerun,
        Locked,
    }
    ```
   -  `InProgress` - the transaction execution started;
   - `Success` or `Failure` - the transaction was completed (successfully or not). In this case, the logic contract does nothing, but only sends a response that the transaction with this hash has already been completed.
  - `DecreaseSuccess` - this status is related to a transfer transaction that occurs between accounts located in different storage. It means that the decrease part has successfully been executed and it’s now necessary to complete the increase part of the transaction;
  - `Locked`- the transaction is executed in 2 messages (2 phase commit protocol), the first message (`Lock`) was executed and the contract expects to receive either `Commit` or `Abort` messages;
- The code hash of the storage contract. The logic contract is able to create a new storage contract when it is necessary. Now the storage creation is implemented as follows: the logic contract takes the first letter of the account address. If the storage contract for this letter is created, then it stores the balance of this account in this contract. If not, it creates a new storage contract

    ```rust
    storage_code_hash: H256
    ```
- The mapping from letters to the storage addresses.

    ```rust
    id_to_storage: HashMap<String, ActorId>
    ```

The logic contract receives from the master contract the following message:

```rust
Message {
    transaction_hash: H256,
    account: ActorId,
    payload: Vec<u8>,
},
```
The `account` is an actor who sends the message to the master contract. The payload is the encoded operation the logic contract has to process:

```rust
pub enum Operation {
   Mint {
       recipient: ActorId,
       amount: u128,
   },
   Burn {
       sender: ActorId,
       amount: u128,
   },
   Transfer {
       sender: ActorId,
       recipient: ActorId,
       amount: u128,
   },
   LockTransfer {
       sender: ActorId,
       recipient: ActorId,
       amount: u128,
   },
   Commit,
   Abort,
   Approve {
       approved_account: ActorId,
       amount: u128,
   },
}
```

Since the enum can be changed during upgrading the logic contract, the master contract does not know a particular type of payload structure. That is why it sends payload as `Vec<u8>` instead of enum `Operation`, and upon receiving this message, the logic contract decodes this into the type it expects to receive.
During the message `Mint`, `Burn` or `Transfer` (not `locking Transfer` for 2PC)  that occurs between accounts that are in the same storage, the logic contract sends only one message to the storage contract.

![img alt](./img/simple.png#gh-light-mode-only)
![img alt](./img/simple-dark.png#gh-dark-mode-only)

When the transfer occurs between 2 different storages, the contract acts as follows:
1. The logic contract sends the `DecreaseBalance `message to the storage contract.
2. The following cases of the message execution are possible:
- `Success`: The logic contract sets the transaction status to `DecreaseSuccess`;
- `Failure`: The logic contract sets the transaction status to `Failure`;
- The message execution ran out of gas. The system sends a signal to the logic contract. One of the solutions is to leave status as it was (`InProgress`) since we cannot know for sure the result of the message execution in the storage contract. It is not necessary to handle that case in the `handle_signal` entrypoint.
3. If the message has been executed successfully, the logic contract sends the message `IncreaseBalance` to another storage contract. It is important to notice that the gas can run out here and the status of the successful previous message execution will not be saved. But that state can be saved in `handle_signal`.
4. If the message `IncreaseBalance` has been executed successfully, the logic contract saves the status and replies to the main contract. And again here, the `handle_signal` can be used to save that status, if the gas ran out after successful `IncreaseBalance` execution.
If the gas ran out during the `IncreaseBalance` execution in the storage contract, we save the status `DecreaseSuccess`, so that you can not track this case in the `handle_signal` function.
The case when the message has been executed with failure must be impossible (It can be possible if let’s say there was a problem with the memory of the contract, however, tracking the filling of the storage contract is also the responsibility of the logic contract). The transaction must be rerun. However, if the error occurs again and again, then you need to return the balance to the sender.

![img alt](./img/transfer.png#gh-light-mode-only)
![img alt](./img/transfer-dark.png#gh-dark-mode-only)

When the `transfer` occurs in two transactions (2 PC):
1. The logic contract sends the message `DecreaseBalance` to the storage contract. If it is successful, it sets the status to `Lock`.

![img alt](./img/lock.png#gh-light-mode-only)
![img alt](./img/lock-dark.png#gh-dark-mode-only)

2. In the next step, the logic contract must receive either `Сommit` or an `Abort` action. If it receives a `Сommit` message, it just sets the transaction status to `Success`. Otherwise, it sends the message `IncreaseBalance` to the storage contract.

![img alt](./img/commit_abort.png#gh-light-mode-only)
![img alt](./img/commit_abort-dark.png#gh-dark-mode-only)

### The master contract architecture
The master contract state has the following fields:
- The address of the contract admin. He has the right to upgrade the logic contract:

    ```rust
    admin: ActorId,
    ```
- The address of the logic contract:

    ```rust
    ft_logic_id: ActorId,
    ```
- The transaction history:

    ```rust
    transactions: HashMap<H256, TransactionStatus>
    ```
    Where the TransactionStatus:
    ```rust
    pub enum TransactionStatus {
        InProgress,
        Success,
        Failure,
    }
    ```

The contract receives a message from the account with `nonce`. It gets the hash of that transaction: it is the hash of the nonce with the account address.
So, it is the user's responsibility to track its `nonce` and increase it. (But it is possible to implement that contract in such a way that it tracks the user number itself, and the field with `nonce` can be optional.)
The main contract just redirects that message to the logic contract indicating the account that sends a message to it.
