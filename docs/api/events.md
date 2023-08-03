---
sidebar_position: 10
sidebar_label: Events
---

# Events

Events are generated for certain operations during execution. The following sections describe events that are part of the default Gear runtime.

To subscribe to all events:

```javascript
const unsub = await api.query.system.events((events) => {
  console.log(events.toHuman());
});
// Unsubscribe
unsub();
```

## Gear Events Types

### MessageQueued

**Summary:** When a user successfully sends a message to a program and it gets added to the Gear message queue.

```rust

MessageQueued {
    /// Generated id of the message.
    id: MessageId,
    /// Account id of the source of the message.
    source: T::AccountId,
    /// Program id, who is the message's destination.
    destination: ProgramId,
    /// Entry point for processing of the message.
    /// On the sending stage, the processing function
    /// of the program is always known.
    entry: MessageEntry,
}

```

### UserMessageSent

**Summary:** When someone has sent a message to the user.

```rust
UserMessageSent {
    /// Message sent.
    message: UserMessage,
    /// Block number of expiration from `Mailbox`.
    ///
    /// Equals `Some(_)` with block number when message
    /// will be removed from `Mailbox` due to some
    /// reasons (see #642, #646 and #1010).
    ///
    /// Equals `None` if message wasn't inserted to
    /// `Mailbox` and appears as only `Event`.
    expiration: Option<T::BlockNumber>,
}
```

### UserMessageRead

**Summary:** When a message has been marked as "read" and it has been removed from the `Mailbox`. This event only affects messages, which were already prior inserted into the `Mailbox`.

```rust
UserMessageRead {
    /// Id of the message read.
    id: MessageId,
    /// The reason for the reading (removal from `Mailbox`).
    ///
    /// NOTE: See more docs about reasons at `gear_common::event`.
    reason: UserMessageReadReason,
}
```

### MessagesDispatched

**Summary:** The result of when a message is processed within the block.

```rust
MessagesDispatched {
    /// Total amount of messages removed from message queue.
    total: MessengerCapacityOf<T>,
    /// Execution statuses of the messages, which were already known
    /// by `Event::MessageQueued` (sent from user to program).
    statuses: BTreeMap<MessageId, DispatchStatus>,
    /// Ids of programs, which state changed during queue processing.
    state_changes: BTreeSet<ProgramId>,
}
```

### MessageWaited

**Summary:** When a message's execution has been delayed and it has been added to the Gear waitlist.

```rust
MessageWaited {
    /// Id of the message waited.
    id: MessageId,
    /// Origin message id, which started messaging chain with programs,
    /// where currently waited message was created.
    ///
    /// Used to identify by the user that this message associated
    /// with him and the concrete initial message.
    origin: Option<GasNodeId<MessageId, ReservationId>>,
    /// The reason of the waiting (addition to `Waitlist`).
    ///
    /// NOTE: See more docs about reasons at `gear_common::event`.
    reason: MessageWaitedReason,
    /// Block number of expiration from `Waitlist`.
    ///
    /// Equals block number when message will be removed from `Waitlist`
    /// due to some reasons (see #642, #646 and #1010).
    expiration: T::BlockNumber,
}
```

### MessageWoken

**Summary:** When a message is ready to continue its execution and has been removed from the `Waitlist`.

```rust
MessageWoken {
    /// Id of the message woken.
    id: MessageId,
    /// The reason of the waking (removal from `Waitlist`).
    ///
    /// NOTE: See more docs about reasons at `gear_common::event`.
    reason: MessageWokenReason,
}
```

### CodeChanged

**Summary:** When a program's code has been altered.

```rust
CodeChanged {
    /// Id of the code affected.
    id: CodeId,
    /// Change applied on code with current id.
    ///
    /// NOTE: See more docs about change kinds at `gear_common::event`.
    change: CodeChangeKind<T::BlockNumber>,
}
```

### ProgramChanged

**Summary:** Any data related to program changed.

```rust
ProgramChanged {
    /// Id of the program affected.
    id: ProgramId,
    /// Change applied on program with current id.
    ///
    /// NOTE: See more docs about change kinds at `gear_common::event`.
    change: ProgramChangeKind<T::BlockNumber>,
}
```

### ProgramResumeSessionStarted

**Summary:** Program resume session has been started.

```rust
ProgramResumeSessionStarted {
  /// Id of the session.
  session_id: SessionId,
  /// Owner of the session.
  account_id: T::AccountId,
  /// Id of the program affected.
  program_id: ProgramId,
  /// Block number when the session will be removed if not finished.
  session_end_block: T::BlockNumber
}
        
```

## Check what the event is

```javascript
api.query.system.events((events) => {
  events
    .filter(({ event }) => api.events.gear.MessageQueued.is(event))
    .forEach(({ event: { data } }) => {
      console.log(data.toHuman());
    });

  events
    .filter(({ event }) => api.events.balances.Transfer.is(event))
    .forEach(({ event: { data } }) => {
      console.log(data.toHuman());
    });
});
```

## Subscribe to specific gear events

### Subscribe to messages sent from a program

```javascript
const unsub = api.gearEvents.subscribeToGearEvent(
  'UserMessageSent',
  ({
    data: {
      message: { id, source, destination, payload, value, reply },
    },
  }) => {
    console.log(`
  messageId: ${id.toHex()}
  source: ${source.toHex()}
  payload: ${payload.toHuman()}
  `);
  },
);
// Unsubscribe
unsub();
```

### Subscribe to messages intended for a program

```javascript
const unsub = api.gearEvents.subscribeToGearEvent(
  'MessageQueued',
  ({ data: { id, source, destination, entry } }) => {
    console.log({
      messageId: id.toHex(),
      programId: destination.toHex(),
      userId: source.toHex(),
      entry: entry.isInit
        ? entry.asInit
        : entry.isHandle
        ? entry.asHandle
        : entry.asReply,
    });
  },
);
// Unsubscribe
unsub();
```

### Subscribe to Transfer events

```javascript
const unsub = await api.gearEvents.subscribeToTransferEvents(
  ({ data: { from, to, amount } }) => {
    console.log(`
    Transfer balance:
    from: ${from.toHex()}
    to: ${to.toHex()}
    amount: ${+amount.toString()}
    `);
  },
);
// Unsubscribe
unsub();
```

### Subscribe to new blocks

```javascript
const unsub = await api.gearEvents.subscribeToNewBlocks((header) => {
  console.log(
    `New block with number: ${header.number.toNumber()} and hash: ${header.hash.toHex()}`,
  );
});
// Unsubscribe
unsub();
```
