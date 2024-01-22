---
sidebar_label: Consistency and Reliability
sidebar_position: 9
---

# Ensuring reliability in asynс programming

One of the key features of the Gear Protocol is its use of the Actor model for message-passing communication. The Actor model framework enables asynchronous messaging and parallel computation, which  drastically improves the achievable speed and scalability of dApps. In the Actor model, programs do not share state and instead communicate with each other through messages. If a program sends an asynchronous message to another program, it has to wait for a reply from the other program before it can proceed with the next operation.

When a program interacts with another program, the transaction becomes "distributed." A distributed transaction is a set of operations performed across multiple databases or, in the case of the Gear Protocol, across multiple actors with their own states. Distributed transactions must possess these properties:
- Atomicity - all data changes are treated as if they were a single operation. That is, either all of the modifications are made, or none of them are made;
- Consistency - this property implies that when a transaction begins and ends, the state of data is consistent.

For example, transactions on the Ethereum blockchain are atomic, meaning that if a transaction fails due to an error, all of its effects on the global state are rolled back as if the transaction never occurred. Many blockchain applications rely on the atomicity of transactions, but this can be a problem when building asynchronous applications using the programming paradigm used on Ethereum, as you may encounter the problem of not being able to recover program state after a failed transaction.

Consider a simple token exchange where a user wants to swap tokens A for tokens B in a liquidity pool. The swap program (hereinafter referred to as the 'contract') would send a message to the token A contract and a message to the token B contract. If one of these messages succeeds and the other fails for some reason, the state of the token A contract would be changed while the state of the token B contract would remain unchanged. This can cause inconsistencies in the state of the data and make it difficult to recover from failed transactions. As a result, it is important to consider different programming paradigms for implementing distributed transactions.

Let's look at different programming methods using the example of a token exchange.

## Splitting a token swap transaction into 3 separate transactions

Consider the following situation: we have a liquidity pool of token A and token B, and also a user who wants to exchange his tokens A for tokens B.

`Step 1` : A user sends a `MakeOrder` message to the swap contract. During that transaction the contract sends a message to the fungible token contract. The result of executing this message can be a success or a failure. The worst case scenario is having a lack of gas when processing a message in the token contract or in the subsequent execution of the swap contract. However, since the token contract supports idempotency, the user can simply restart the transaction and complete it.

![img alt](./img/1.step1.png#gh-light-mode-only)
![img alt](./img/1.step1-dark.png#gh-dark-mode-only)

`Step 2`:  A user sends an `ExecuteOrder` message to the swap contract. The swap contract just calculates the amount of tokens a user will receive and saves the new state of the liquidity poll.

![img alt](./img/1.step2.png#gh-light-mode-only)
![img alt](./img/1.step2-dark.png#gh-dark-mode-only)

`Step 3`:  A user sends a `Withdraw` message to the swap contract and receives tokens B. The situation here is the same as in the first step.

![img alt](./img/1.step3.png#gh-light-mode-only)
![img alt](./img/1.step3-dark.png#gh-dark-mode-only)

It is possible to execute a swap in one transaction. To resolve the problem of atomicity we can use the following patterns here:
- `2 PC - 2 Phase Commit protocol` (And also its extension - 3 phase commit protocol);
- `Saga Pattern`.

## Two phase commit protocol

**Theory**:

Use a coordinator that sends messages to participants. The `two-phase commit protocol` has two parts: the `prepare` phase and the `commit` phase.

**Preparation phase:**
During the preparation phase, the coordinator and participants perform the following dialog:
- `Coordinator`:
The coordinator directs each participant database server to prepare to commit the transaction.
- `Participants`:
Every participant notifies the coordinator whether it can commit to its transaction branch.
- `Coordinator`:
The coordinator, based on the response from each participant, decides whether to commit or roll back the transaction. It decides to commit only if all participants indicate that they can commit to their transaction branches. If any participant indicates that it is not ready to commit to its transaction branch (or if it does not respond), the coordinator decides to end the global transaction.

**Commit phase:**

During the commit phase, the coordinator and participants perform the following dialog:
- `Coordinator`:
The coordinator writes the commit record or rollback record to the coordinator's logical log and then directs each participant to either commit or roll back the transaction.
- `Participants`:
If the coordinator issued a commit message, the participants commit the transaction by writing the commit record to the logical log and then sending a message to the coordinator acknowledging that the transaction was committed. If the coordinator issued a rollback message, the participants roll back the transaction but do not send an acknowledgment to the coordinator.
- `Coordinator`:
If the coordinator issues a message to commit the transaction, it waits to receive acknowledgment from each participant before it ends the global transaction. If the coordinator issued a message to roll back the transaction, it does not wait for acknowledgments from the participants.

In the context of a token swap contract example, one may utilize it as follows: The scenario involves an account seeking to swap their tokens (referred to as tokenA) for alternative tokens (tokenB) by leveraging the liquidity pool within the swap contract.

In that case the swap contract is a coordinator contract and tokens contracts are participants.

The swap contract makes the following steps:

**Prepare phase**

- `Swap contract:`
Swap contract sends the messages to token contracts to prepare transfer tokens (Messages can be sent in parallel). In fact, token contracts must lock funds at this stage.
- `Token contract`:
Token contracts make all necessary checks, and in case of success, lock funds and reply to the swap contract that they are ready to make a transaction.
- `Swap contract`:
Swap contract handles the messages from the token contracts and decides whether to commit or abort the global transaction.
receives tokens B. The situation here is the same as in the first step.

![img alt](./img/2.prepare.png#gh-light-mode-only)
![img alt](./img/2.prepare-dark.png#gh-dark-mode-only)

**Commit phase**

- `Swap contract`:
If token contracts confirm their readiness to execute the transaction, the swap contract sends them a message to commit the state. Otherwise, the swap contract tells them to abort the transaction.
- `Token contract`:
Token contracts finally change their state and send replies to the swap contract;
- `Swap contracts:
Swap contract handles the messages from the token contracts and saves the result about transaction execution.

![img alt](./img/2.commit.png#gh-light-mode-only)
![img alt](./img/2.commit-dark.png#gh-dark-mode-only)

Of course, all that workflow handles the case when the gas runs out during the message execution.

`Pros:`
- Messages can be sent in parallel;
- If cases with a lack of gas are taken into account, then the data consistency is achieved.

`Cons:`
- The participants have to wait for the message from the coordinator, they can’t commit or abort themselves;
- The coordinator plays an important role: if it fails to send the message then all participants go to the blocked state (in our example: the funds in token contracts are blocked).

## Three phase commit protocol.

**Theory**: It is similar to two-phase commit protocol but it tries to solve the problems with blocking the state of participants and to give the participants the opportunity to recover their states themselves.

**Prepare phase:**
The same steps of two phase commit protocol are followed here:
- `Coordinator`:
The coordinator sends a prepare message to all participants and waits for replies;
- `Participants`:
If the participants are ready to commit a transaction they send the ready message, otherwise they send no message to the coordinator.
- `Coordinator`:
Based on replies the coordinator decides either to go to the next state or not. If any of the participants respond with no message or if any of the participants fails to respond within a defined time, the coordinator sends an abort message to every participant.  It is important to highlight the differences from two phase commit protocol:
   - The coordinator limits the response time from the participant. This can be implemented by sending a message with an indicated amount of gas or indicated number of blocks the coordinator is ready to wait;
   - If the coordinator fails at this state, then the participants are able to abort the transaction (i.e. unlock their state) using delayed messages. So, in that phase, the timeout cases abort.

**Prepare-to-commit phase:**
- `Coordinator`:
The coordinator sends a prepare-to-commit message to all participants and gets acknowledgements from everyone;
- `Participants`:
Participants: Receiving a prepare-to-commit message, a participant knows that the unanimous decision was to commit. As mentioned in the preparation phase, if a participant fails to receive this message in time, then it aborts. However, if a participant receives an abort message, then it can immediately abort the transaction. 
The possible problem: the coordinator fails when sending a prepare-to-commit to participants. So some participants are in Phase 2, others are in Phase 1. It's a disaster because the first group will commit, the second group will abort in case of timeout. This phase must ensure that If one of the participants has received a precommit message, they can all commit. If the coordinator falls, any of the participants, being at the second stage, can become the coordinator itself and continue the transaction.
- `Coordinator`:
Having received acknowledgements from all the participants, the coordinator goes to the next phase.

The three-phase commit protocol accomplishes two things:
1. Enables use of a `recovery coordinator` (it can be a coordinator itself that starts a new transaction, or a participant). If a coordinator died, a recovery coordinator can query a participant.
   - If the participant is found to be in phase 2, that means that every participant has completed phase 1 and voted on the outcome. The completion of phase 1 is guaranteed. It is possible that some participants may have received commit requests (phase 3). The recovery coordinator can safely resume at phase 2.
   - If the participant was in phase 1, that means NO participant has started commits or aborts. The protocol can start at the beginning.
   - If the participant was in phase 3, the coordinator can continue in phase 3 – and make sure everyone gets the commit/abort request
2. Every phase can now time out – there is no indefinite wait as in the two-phase commit protocol.
   - `Phase 1`:
Participant aborts if it doesn’t hear from a coordinator in time;
Coordinator sends aborts to all if it doesn’t hear from any participant.
   - `Phase 2`:
If a participant times out waiting for a coordinator, elect a new coordinator.

Back to the swap contract.

**Preparation phase**:
The following cases are possible:
- all token contracts receive the message;
- the swap contract fails to wait for response from any token contract
- the swap contract fails itself.

In the case of a fall, if a transaction isn't restarted, the swap contract will not move to the second phase and the token contracts will unlock their state using delayed messages.

![img alt](./img/3.prepare.png#gh-light-mode-only)
![img alt](./img/3.prepare-dark.png#gh-dark-mode-only)

**Pre-Commit phase**:
At this stage, there can be a failure in the swap contract or in the token contract only due to the lack of gas. To address this issue, gas reservation can be utilized as follows:
- The swap contract receives the information about error in its `handle_signal`;
- Using gas reservation (so, it’s necessary to care about gas reservations before), the swap contract sends a message to itself to restart the transaction from the second phase. (The same logic can also be used in the `preparation phase`).

![img alt](./img/3.precommit.png#gh-light-mode-only)
![img alt](./img/3.precommit-dark.png#gh-dark-mode-only)

**Commit phase**:
Like the previous stage, failure can occur solely due to the absence of gas. In this situation, it is not as critical, as all participants can commit to the process.

## Saga pattern
**Theory**:
A `saga` is a sequence of local transactions. Each local transaction updates the database and publishes a message or event to trigger the next local transaction in the saga. If a local transaction fails because it violates a business rule then the saga executes a series of compensating transactions that undo the changes that were made by the preceding local transactions. Thus, Saga consists of multiple steps whereas `2PC` acts like a single request.
There are two ways of coordination sagas:

- `Choreography` - each local transaction publishes domain events that trigger local transactions in other services;
- `Orchestration` - an orchestrator (object) tells the participants what local transactions to execute.

Consider the `orchestration based Saga`, where an orchestrator (swap contract) manages the entire operation from a central point.

The swap operation consists of the following steps:

1. Swap contract receives a message to exchange tokens in the liquidity pool. So, it must transfer tokens A from the account to its address and then transfer tokens B to the user.
2. It creates the first task: transfer tokens from the user to the swap contract. It also creates a compensating transaction for the first task: transfer tokens from the swap contract back to the user. The second task is to transfer tokens from the swap contract to the user.
3. It starts executing the first task. If the execution fails, it cancels the transaction. If it’s successful, the swap contract executes the second task;
4. If the execution of the second task is successful, the transaction is completed. Otherwise, the swap contract executes the compensation transaction for the first task.

![img alt](./img/saga.png#gh-light-mode-only)
![img alt](./img/Saga-dark.png#gh-dark-mode-only)

It is important to note that compensatory transactions should not fail due to any logical error. They can only fall due to lack of gas. If this happens, then you need to restart the transaction again or use the gas reservation. The `idempotency` of the token contract guarantees that the transaction will be completed to the end without any duplicate transactions.
