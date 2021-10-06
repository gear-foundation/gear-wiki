---
sidebar_label: "Message format"
sidebar_position: 1
---

# Message communication format

Interaction with each program takes place by messaging.

Messages in Gear have common interface with the following parameters:

```
source account,
target account,
payload,
gas_limit
value
```

`gas_limit` is the amount of gas that users are willing to spend to process the message.  

`value` is a value to be transferred to target account. In the special message of the initial program upload, value will be transferred to a balance of the newly created account for the program.


In the case of the program, there are the following types of messages:

- From user to program
- From program to program
- From program to user
- A special message from user to upload a new program to the
network. Payload must contain Wasm file of the program itself. Target account must not be specified - it will be created as a part of processing message post.


## Gas

Gear node charges gas fee during message processing.
<!-- Describe gas charging process -->

## Message process module

Depending on the context the program interprets messages differently. To process messages in Gear programs, the proprietary `gstd` standart library and the `::msg` module are used.

<!-- TODO describe msg module functions -->





