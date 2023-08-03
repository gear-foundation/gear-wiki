---
sidebar_position: 9
sidebar_label: Mailbox
---

# Mailbox

The mailbox contains messages from the program that are waiting for user action.

## Read messages from Mailbox

```javascript
const api = await GearApi.create();
const mailbox = await api.mailbox.read(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
);
console.log(mailbox);
```

## Claim value

To claim value from a message in the mailbox use `api.mailbox.claimValue.submit` method.

```javascript
const api = await GearApi.create();
const submitted = await api.mailbox.claimValue.submit(messageId);
await api.mailbox.claimValue.signAndSend(/* ... */);
```

## Waitlist

To read the program's waitlist use `api.waitlist.read` method.

```javascript
const api = await GearApi.create();
const programId = '0x1234…';
const waitlist = await api.waitlist.read(programId);
console.log(waitlist);
```
