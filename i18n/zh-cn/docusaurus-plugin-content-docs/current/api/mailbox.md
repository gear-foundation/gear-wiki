---
sidebar_position: 9
sidebar_label: Mailbox
---

# Mailbox

mailbox 用于存储从程序发送至用户的信息。

## 从 Mailbox 中读取信息

```javascript
const api = await GearApi.create();
const mailbox = await api.mailbox.read('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
console.log(mailbox);
```

## Claim value

```javascript
const api = await GearApi.create();
const submitted = await api.mailbox.claimValue.submit(messageId);
await api.mailbox.claimValue.signAndSend(...);
```