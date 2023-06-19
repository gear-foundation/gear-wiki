---
sidebar_position: 9
sidebar_label: Mailbox
---

# Mailbox

The mailbox contains messages from the program that are waiting for user action.

## Read messages from Mailbox

```javascript
const gearApi = await GearApi.create();
const mailbox = await gearApi.mailbox.read(
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
);
console.log(mailbox);
```

## Claim value

To claim value from a message in the mailbox use `GearApi.mailbox.claimValue.submit` method.

```javascript
const gearApi = await GearApi.create();
const submitted = await gearApi.mailbox.claimValue.submit(messageId);
await gearApi.mailbox.claimValue.signAndSend(/* ... */);
```

## Waitlist

To read the program's waitlist use `GearApi.waitlist.read` method.

```javascript
const gearApi = await GearApi.create();
const programId = '0x1234…';
const waitlist = await gearApi.waitlist.read(programId);
console.log(waitlist);
```
