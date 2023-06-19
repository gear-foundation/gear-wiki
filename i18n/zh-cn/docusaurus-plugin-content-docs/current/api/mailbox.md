---
sidebar_position: 9
sidebar_label: Mailbox
---

# Mailbox

mailbox 用于存储从程序发送至用户的信息。

## 从 Mailbox 中读取信息

```javascript
const gearApi = await GearApi.create();
const mailbox = await gearApi.mailbox.read('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
console.log(mailbox);
```

## Claim value

```javascript
const gearApi = await GearApi.create();
const submitted = await gearApi.mailbox.claimValue.submit(messageId);
await gearApi.mailbox.claimValue.signAndSend(/* ... */);
```

## 等待列表

要读取程序的等待列表，可以使用 `GearApi.waitlist.read` 方法。

```javascript
const gearApi = await GearApi.create();
const programId = '0x1234…';
const waitlist = await gearApi.waitlist.read(programId);
console.log(waitlist);
```
