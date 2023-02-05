---
sidebar_position: 3
---

# Mailbox

When the program sends a message to the user, this message is placed in the user's mailbox. Actually, the mailbox is a dedicated storage that keeps a message received from a program.

The user can detect a message received by subscribing to the [`UserMessageSent`](https://docs.gear.rs/pallet_gear/pallet/enum.Event.html#variant.UserMessageSent) event.

When using the IDEA website one should go to the https://idea.gear-tech.io/mailbox section.

:::note

A message is charged for being in the mailbox. Therefore, a message can be in the mailbox for a limited time.

:::

Let's explore possible user reactions to the mailbox's message.

## User sends a reply to the message

The program can send a message to the user and wait for a reply from him. The user can reply using a [`send_reply`](https://docs.gear.rs/pallet_gear/pallet/struct.Pallet.html#method.send_reply) extrinsic. The value associated with the message is transferred to the user's account, the message is removed from the mailbox, and the new reply message is added to the message queue.

## User claims value from a message in the mailbox

If a message in the mailbox has an associated value, the user can claim it using a [`claim_value`](https://docs.gear.rs/pallet_gear/pallet/struct.Pallet.html#method.claim_value) extrinsic. Value is transferred to the user's account and the message is removed from the mailbox.

## User ignores a message in the mailbox

A message is charged for every block in the mailbox within its gas limit. If the message hasn't an explicit gas limit, gas is borrowed from the origin's limit (e.g. an actor that has initiated the execution).

When the message's gas runs out, the message is removed from the mailbox, and the associated value transferred back to the message sender.
