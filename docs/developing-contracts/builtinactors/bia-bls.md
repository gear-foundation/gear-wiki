---
sidebar_label: BLS12-381
sidebar_position: 2
---

# BLS12-381

[BLS12-381](https://github.com/gear-tech/gear/blob/master/pallets/gear-builtin/src/bls12_381.rs) is the first Built-in Actor integrated into the Vara runtime. It provides an interface that enables validators to perform native runtime computations of BLS cryptography methods.

BLS cryptography facilitates efficient signature aggregation and verification at scale using Elliptic Curve cryptography. However, these operations are computationally intensive, and the Wasm VM used in Gear is not capable of processing them quickly enough to fit within the single block time of Vara’s network (which is 3 seconds).

The BLS12-381 Built-in Actor addresses this issue. A program on the blockchain can send a message to this actor's address with the necessary arguments for a BLS method call. The validator then executes this in native mode off-chain, which does not incur additional gas fees, and subsequently returns the result to the originating program that initiated the request.

:::note
While it is technically possible to execute BLS methods on-chain, doing so would occupy more than 30 blocks on the Vara network. This process would require complex optimization of the calculation algorithm, involving division into 30+ equivalent parts and would also result in higher gas costs.
:::
