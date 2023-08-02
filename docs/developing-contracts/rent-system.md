---
sidebar_label: Program Rent
sidebar_position: 5
---

Gear Protocol utilizes a rent-based program management system. When developers upload a program (smart contract) to the network, it is assigned an expiration date. The expiration period is measured in blocks.

After the expiration date, the program is automatically removed from storage, unless the owner chooses to extend its life by paying rent. The owner must indicate the number of additional blocks they can pay for, and they need to pay the rent in utility tokens to keep the program active beyond its initial expiration date.

:::info
Current initial rent period: ***5,000,000*** blocks (on Vara it will be around 173 days)
:::

After uploading a program, you can observe a similar event:

`gear.ProgramChanged`

```json
{
    "id": "0xde76e4cf663ff825d94944d6f060204e83fbb5e24f8dfdbbdc25842df4f4135d",
    "change": {
        "Active": {
            "expiration": "12,834,248"
        }
    }
}
```

## How to extend the eent of the program?

To extend the rent period of a program, simply call the special extrinsic `gear.payProgramRent(programId, blockCount)`. [See more](/docs/api/program-rent)

## Can I restore a deleted program?

Yes. Since the blockchain stores all states for the entire history, you can restore the state of the program to the previous block before it was deleted.

## Why does gear use the program rent system?

- Optimization and efficient resource usage
- Stimulating utility token usage
