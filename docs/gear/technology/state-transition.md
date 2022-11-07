---
sidebar_position: 6
sidebar_label: State Transition
---

# State transition

Each system follows the rules according to which the state of the system evolves. As the network processes new input data, the state is advanced according to state transition rules. This input data is packed in granular pieces of information called transactions.

Gear nodes maintain and synchronize a transaction pool which contains all those new transactions. When any node (validator or not) receives a transaction, the node propagates the transaction to all connected nodes. For advanced reading how the transaction pool operates, refer to [Substrate Documentation](https://substrate.dev/docs/en/knowledgebase/learn-substrate/tx-pool).

When a Gear validator node comes to produce a new block, some (or all) transactions from the pool are merged into a block and the network undergoes a state transition via this block. Transactions that were not taken in the last block remain in the pool until the next block is produced.

A Gear Network supports the following types of transactions:

1. **Upload a program** - user uploads new program(s) - smart-contracts
2. **Upload a code** - user uploads a code to create programs from it later
3. **Create a program** - program or user creates a program from the previously uploaded code
4. **Send a message** - program or user fills the message queue
5. **Send a reply** - similar to the message but can be sent only as a reply to the received message
6. **Claim a value from mailbox** - user requests to transfer value associated with the message in his mailbox
7. **Dequeue messages** - validators (block producers) dequeue multiple messages, running associated programs
8. **Balance transfers** - Gear engine performs user-program-validator balance transfers

Message processing is performed in the reserved space of the block construction/import time. It is guaranteed that message processing will be executed in every block, and at least at some particular rate determined by current instance settings.

### Upload a program

Designated authorities (or any user for public implementation) of Gear network can propose a new program saved to the state. For public networks, a balance associated with a program is also provided. This new balance then constitutes the initial balance (Existential Deposit).

### Upload a code

One can upload a Wasm code without initialization. This code cannot be executed as a program but it is saved to the storage and can be used for creating new programs from it. Both users and programs can create programs from uploaded code.

### Create a program

Both users and programs can create new programs from the uploaded code. The code can be reused many times to produce several programs.

### Send a message

End-users interact with programs via sending messages to a Gear Network. Messages sent to a Gear Network fill up the global message queue. This queue can be viewed as a runtime-driven transaction queue but with the guarantee that any message accepted into it will eventually be processed. Putting a message in the queue is not free and therefore a message is guaranteed to be dispatched.

Programs also exchange messages with each other. The result of the received message can be another message (reply) addressed to another program or a user or a designated behavior to be used for the next message it receives. A program can also send a message the execution result of which will be a creation of another program.

### Send a reply

The reply is similar to the message described above with the only difference that the reply can be sent only as a response to the received message. Users can send the reply to the message contained in their mailboxes.

### Claim a value from mailbox

After receiving a message with an associated value, the user has to claim this value to transfer it from the message to the user. Unclaimed value is to be returned to the sender after the message leaves the mailbox after its gas limit exhausts.

### Dequeue messages

Validators can choose which messages to dequeue when it's their turn to produce the next block. It eliminates the need of each particular validator to maintain the full memory state. Dequeuing occurs only at the end of each block. During dequeuing, new messages can be generated. They can also be processed in this phase, but also can stay in the queue for the next block (and another validator).

### Balance transfers

Regular balance transfers can be performed in two ways. The first way is to use correspondent extrinsics (e.g. `transfer`, `setBalance`, etc.) from the Substrate `Balances` pallet. The second way is to send a message from one user to another with associated value.

### Messages, blocks and events lifecycle

The picture below illustrates the eternal lifecycle of Gear machinery. As the actor model for communications dictates, nothing is shared, there are only messages. Messages with destination "system" end up in the event log to be inspected in the user space.

![alt text](/assets/mq.jpg)
