---
sidebar_label: DAO
sidebar_position: 8
---

# Decentralized autonomous organization

## Introduction

### What is DAO

A decentralized autonomous organization, or DAO for short, is a novel approach to managing organizations or institutions that enables individuals to collaborate for a specific cause in transparent, fair, and honest ways. DAOs can be likened to online communities of like-minded individuals, collectively owned and managed by their members in equitable ways.

Decisions are made through proposals and votes, ensuring that every member within a decentralized autonomous organization has a voice. This is significant because it prevents any central entity from manipulating matters for personal gain or based on personal beliefs.

DAOs provide secure alternatives for pooling funds for a particular cause. It's not limited to ordinary financial management by members. For example, a group could establish a DAO to oversee a charity, accepting donations and distributing aid in an accountable manner. However, the most prominent use cases for DAOs at the moment involve decentralized investment funds. In such scenarios, a group of investors establishes a venture fund that combines capital and transparently votes on its allocation.

### DAO application example by Gear

Anyone can easily create their own DAO application and run it on the Gear Network. To facilitate this, Gear has provided an example of the DAO smart contract, which is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/dao-light).

This article explains the programming interface, data structure, basic functions, and their purposes. You can use it as-is or modify it to suit your own scenarios.

<!-- In addition, Gear provides an example implementation of the DAO user interface to demonstrate its interaction with the smart contract in the Gear Network. You can watch a video on how to get the DAO application up and running and its capabilities here: **https://youtu.be/6lxr7eojADw**. The source code for the DAO application is available on [GitHub](https://github.com/gear-foundation/dapps-dao-app).
-->

## Logic
To use the hashmap you should add the `hashbrown` package into your Cargo.toml file:
```toml
[dependencies]
# ...
hashbrown = "0.13.1"
```

The contract has the following structs:

```rust
use hashbrown::HashMap;

struct Dao {
    approved_token_program_id: ActorId,
    period_duration: u64,
    voting_period_length: u64,
    grace_period_length: u64,
    total_shares: u128,
    members: HashMap<ActorId, Member>,
    proposal_id: u128,
    proposals: HashMap<u128, Proposal>,
    locked_funds: u128,
    balance: u128,
    transaction_id: u64,
    transactions: BTreeMap<u64, DaoAction>,
}
```
where:

`approved_token_program_id` - the reference to the token contract (ERC20) that users use as pledge to get the share in the DAO.

`period_duration` - the smallest unit time interval for the DAO, in ms.

`voting_period_length` - voting time interval. Number of intervals for voting time = period duration * voting_period_length.

`grace_period_length` - after the voting period the DAO members are given a period of time in which they can leave the DAO(ragequit) without being diluted and ultimately affected by the proposal’s acceptance into the DAO.


`total_shares` - total shares across all members. Initially it is zero.

`members` - members of the DAO.

`proposal_id` - the index of the last proposal.

`proposals` - all proposals (the proposal queue).

`locked_funds` - tokens that are locked when a funding proposal is submitted.

`balance` - the amount of tokens in the DAO contract.

`transaction_id` - the transaction number that is used for tracking transactions in the fungible token contract.

`transactions` - the transaction history.


Parameters `approved_token_program_id`, `period_duration`, `grace_period_length` are set when initializing a contract. The contract is initialized with the following struct:

```rust
struct InitDao {
    approved_token_program_id: ActorId,
    period_duration: u64,
    voting_period_length: u64,
    grace_period_length: u64,
}
```

The proposal struct:

```rust
 pub struct Proposal {
    pub proposer: ActorId, /// - the member who submitted the proposal
    pub applicant: ActorId, /// - the applicant who wishes to become a member
    pub yes_votes: u128, /// - the total number of YES votes for that proposal
    pub no_votes: u128, /// - the total number of NO votes for that proposal
    pub quorum: u128, /// - a certain threshold of YES votes in order for the proposal to pass
    pub processed: bool, /// - true if the proposal has already been processed
    pub did_pass: bool, /// - true if the proposal has passed
    pub details: String, /// - proposal details
    pub starting_period: u64, /// - the start of the voting period
    pub ended_at: u64, /// - the end of the voting period
    pub votes_by_member: BTreeMap<ActorId, Vote>, /// - the votes on that proposal by each member
}
```
The member struct:

```rust
pub struct Member {
    pub shares: u128, /// - the shares of that member
    pub highest_index_yes_vote: u128, /// - the index of the highest proposal on which the members voted YES (that value is checked when user is going to leave the DAO)
}
```

The actions that the contract receives outside are defined in enum `DaoActions`. The contract's replies are defined in the enum `DaoEvents`.

### DAO functions

- Joining DAO. To join the DAO and become a DAO member, a user needs to send the following message to the DAO contract:"

```rust
/// Deposits tokens to DAO
/// The account gets a share in DAO that is calculated as: (amount * self.total_shares / self.balance)
///
/// On success replies with [`DaoEvent::Deposit`]
Deposit {
    /// the number of fungible tokens that user wants to deposit to DAO
    amount: u128,
},
```

 - The funding proposal. The 'applicant' is an actor that will be funded:
```rust
/// The proposal of funding.
///
/// Requirements:
///
/// * The proposal can be submitted only by the existing members;
/// * The receiver ID can't be the zero;
/// * The DAO must have enough funds to finance the proposal
///
/// On success replies with [`DaoEvent::SubmitFundingProposal`]
SubmitFundingProposal {
    /// an actor that will be funded
    receiver: ActorId,
    /// the number of fungible tokens that will be sent to the receiver
    amount: u128,
    /// a certain threshold of YES votes in order for the proposal to pass
    quorum: u128,
    /// the proposal description
    details: String,
},
```

 - The member or the delegate address of the member submits their vote (YES or NO) on the proposal.

```rust
/// The member submits a vote (YES or NO) on the proposal.
///
/// Requirements:
/// * The proposal can be submitted only by the existing members;
/// * The member can vote on the proposal only once;
/// * Proposal must exist, the voting period must have started and not expired;
///
///  On success replies with [`DaoEvent::SubmitVote`]
SubmitVote {
    /// the proposal ID
    proposal_id: u128,
    /// the member  a member vote (YES or NO)
    vote: Vote,
},
```

 - Members have the option to withdraw their capital during a grace period. This feature is useful when members disagree with the outcome of a proposal, especially if the acceptance of that proposal could impact their shares. A member can initiate a 'ragequit' only if they have voted 'NO' on the proposal.

```rust
/// Withdraws the capital of the member
///
/// Requirements:
/// * `msg::source()` must be DAO member;
/// * The member must have sufficient amount of shares;
/// * The latest proposal the member voted YES must be processed;
///
///  On success replies with [`DaoEvent::RageQuit`]
RageQuit {
    /// The amount of shares the member would like to withdraw
    amount: u128,
},
```

 - The proposal processing occurs after the proposal completes its grace period. If the proposal is accepted, the tribute tokens are deposited into the contract, and new shares are minted and issued to the applicant. In the event of rejection, the tribute tokens are returned to the applicant.

```rust
/// The proposal processing after the proposal completes during the grace period.
/// If the proposal is accepted, the indicated amount of tokens are sent to the receiver.
///
/// Requirements:
/// * The previous proposal must be processed;
/// * The proposal must exist and be ready for processing;
/// * The proposal must not already be processed.
///
/// On success replies with [`DaoEvent::ProcessProposal`]
ProcessProposal {
    /// the proposal ID
    proposal_id: u128,
},
```
- The option to resume the transaction is available. If a transaction hasn't been completed due to a network failure, the user can send a `Continue` message specifying the transaction ID that needs to be finalized:

```rust
 /// Continues the transaction if it fails due to lack of gas
/// or due to an error in the token contract.
///
/// Requirements:
/// * Transaction must exist.
///
/// On success replies with the DaoEvent of continued transaction.
Continue(
    /// the transaction ID
    u64,
),
```
## Consistency of contract states
The `DAO` contract interacts with the `fungible` token contract. Each transaction that changes the states of DAO and the fungible token is stored in the state until it is completed. User can complete a pending transaction by sending a message `Continue` indicating the transaction id. The idempotency of the fungible token contract allows to restart a transaction without duplicate changes which guarantees the state consistency of these 2 contracts.

The `DAO` contract interacts with the `fungible token` contract. Every transaction that alters the states of the DAO and the fungible token is recorded in the state until it is finalized. Users can complete a pending transaction by sending a `Continue` message along with the transaction ID. The idempotency feature of the fungible token contract allows transactions to be restarted without duplicating changes, ensuring the state consistency of these two contracts.

<!--
## User interface

A [Ready-to-Use application](https://dao.gear-tech.io/) example provides a user interface that interacts with [DAO](https://github.com/gear-foundation/dapps-dao-light) and [gFT](https://github.com/gear-foundation/dapps-fungible-token) smart contracts.

Gear Fundible Token enables creation of utility token DAO, check [this article](gft-20.md) for details.

This video demonstrates the entire configuration and user interaction workflow: **https://youtu.be/6lxr7eojADw**

![img alt](./img/dao-1.jpg)

A DAO application source code is available on [GitHub](https://github.com/gear-foundation/dapps-dao-app).

### Configure basic dApp in .env:

```sh
REACT_APP_NETWORK
REACT_APP_CONTRACT_ERC
REACT_APP_CONTRACT_DAO
```

- `REACT_APP_NETWORK` is Gear network address (wss://rpc-node.gear-tech.io:443)
- `REACT_APP_CONTRACT_ERC` is Fundible Token contract address
- `REACT_APP_CONTRACT_DAO` is DAO contract address

An example is available: [here](https://github.com/gear-foundation/dapps-dao-app/blob/master/.env.example)

### How to run

Install required dependencies:
```sh
yarn
```

Run:
```sh
yarn run start
```
-->

## Program metadata and state
Metadata interface description:

```rust
pub struct DaoMetadata;

impl Metadata for DaoMetadata {
    type Init = In<InitDao>;
    type Handle = InOut<DaoAction, DaoEvent>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = Out<DaoState>;
}
```
To display the full contract state information, the `state()` function is used:

```rust
#[no_mangle]
extern "C" fn state() {
    msg::reply(
        unsafe {
            let dao = DAO.as_ref().expect("Uninitialized dao state");
            let dao_state: DaoState = dao.into();
            dao_state
        },
        0,
    )
    .expect("Failed to share state");
}
```
To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `DaoState` state. For example - [gear-foundation/dapps/dao/state](https://github.com/gear-foundation/dapps/tree/master/contracts/dao/state):

```rust
#[metawasm]
pub trait Metawasm {
    type State = DaoState;

    fn is_member(account: ActorId, state: Self::State) -> bool {
        ...
    }

    fn is_in_whitelist(account: ActorId, state: Self::State) -> bool {
        ...
    }

    fn get_proposal_id(state: Self::State) -> u128 {
        ...
    }

    fn get_proposal_info(id: u128, state: Self::State) -> Proposal {
        ...
    }

    fn get_member_info(account: ActorId, state: Self::State) -> Member {
        ...
    }
}
```

## Source code
The source code for this DAO smart contract example and its testing implementation are available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/dao-light).

The extended version of DAO that includes admin, membership proposals and delegated voting can be found at [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/dao).

<!--The application source code is available in: [https://github.com/gear-foundation/dapps-dao-app](https://github.com/gear-foundation/dapps-dao-app).
-->

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
