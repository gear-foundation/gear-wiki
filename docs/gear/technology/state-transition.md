---
sidebar_position: 3
sidebar_label: State Transition
---

# State transition

Each system follows the rules according to which the state of the system evolves. As the network processes new input data, the state is advanced according to state transition rules. This input data is packed in granular pieces of information called transactions.

Gear nodes maintain and synchronize a transaction pool which contains all those new transactions. When any node (validator or not) receives a transaction, the node propagates the transaction to all connected nodes. For advanced reading how the transaction pool operates, refer to [Substrate Documentation](https://substrate.dev/docs/en/knowledgebase/learn-substrate/tx-pool).

When a Gear validator node comes to produce a new block, some (or all) transactions from the pool are merged into a block and the network undergoes a state transition via this block. Transactions that were not taken in the last block remain in the pool until the next block producing.

Gear supports the following types of transactions:

1.	**Create a program** - user uploads new programs (smart-contracts)
2.	**Send a message** - programs or users fill the message queue
3.	**Dequeue messages** - validators (block producers) dequeue multiple messages, running associated programs
4.	**Balance transfers** - Gear engine performs user-program-validator balance transfers

Message processing is performed in the reserved space of the block construction/import time. It is guaranteed that message processing will be executed in every block, and at least at some particular rate determined by current instance settings.

### Create a program

Designated authorities (or any user for public implementation) of Gear network can propose a new program saved to the state. For public networks, a balance associated with a program is also provided. This new balance then constitutes the initial balance (Existential Deposit).

### Send a message

End-users interact with programs and as a result, send messages to Gear network. Messages sent to the Gear network fill up the global message queue. This queue can be viewed as a runtime-driven transaction queue but with the guarantee that any message accepted into it will eventually be processed. Putting a message in the queue is not free and therefore a message is guaranteed to be dispatched.

### Dequeue messages

Validators can choose which messages to dequeue when it's their turn to produce the next block. It eliminates the need for each particular validator to maintain the full memory state. Dequeuing occurs only at the end of each block. During dequeuing, new messages can be generated. They can also be processed in this phase, but also can stay in the queue for the next block (and another validator).

### Balance transfers

Regular balance transfers are performed inside Substrate Balances module.

### Messages, blocks and events lifecycle

The picture below illustrates the eternal lifecycle of Gear machinery. As the actor model for communications dictates, nothing is shared, there are only messages. Messages with destination "system" end up in the event log to be inspected in the user space.

![alt text](/assets/mq.jpg)
