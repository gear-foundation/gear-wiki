---
sidebar_label: Gasless and Signless
sidebar_position: 2
---

# Gasless and Signless Transactions

This article outlines an example of a JavaScript frontend implementation that interacts with a program running on the blockchain, where users do not need to pay gas fees or sign any transactions on-chain. 

This is a [modular](https://github.com/gear-foundation/dapps/tree/master/frontend/packages/signless-transactions) implementation that can be re-used in other dApps running on Gear-powered networks.

## Frontend Implementation with Signless Transactions

The frontend of a decentralized application (dApp) can interact seamlessly with programs on the blockchain using signless transactions. This interaction is facilitated by the `signless-transactions` package, which offers tools scalable across all dApp applications. 

### Creating Signless Sessions

The process begins by generating a random [Keyring Pair](../../../api/keyring.md), which is stored in the browser's local storage as JSON. This pair is used for future signless sessions. A [voucher](../../../api/vouchers.md) is created for this keyring pair by the user's main account, with its balance being utilized for transactions on behalf of the pair. The cost for creating a voucher is currently set at 30 VARA.

```javascript
const { extrinsic } = await api.voucher.issue(session.key, voucherValue, undefined, [programId]);
```

A signless session is created using an object containing the key (temporary account), duration (validity timeframe), and allowed_actions (permissible messages). An extrinsic, which is signed and sent to create the session, encapsulates these details. Once active, transactions are sent on the session's behalf.

To establish a session, an array of the `CreateSession` message extrinsic and the voucher extrinsic for issuing the voucher are batch signed and sent.

### Deleting Signless Sessions

To delete a session, the `DeleteSessionFromAccount` message extrinsic is used. If a session's voucher needs to be revoked to return the balance to the account, it can only be done if the voucher is expired. A [decline](../../../api/vouchers#decline-a-voucher) transaction is required first to expire the voucher before revocation.

### Simultanious Gasless and Signless Mode

The signless mode can be combined with the gasless mode, where the voucher for the keyring pair is issued from the gasless account, but the signature is still performed by the keyring pair itself. The difference lies in the session creation object, which includes a signature, ensuring that the session is created using the pair's voucher balance.

```javascript
const messageExtrinsic = getMessageExtrinsic({
    CreateSession: { key, duration, allowedActions, signature },
});

const voucherExtrinsic = api.voucher.call(voucherId, {SendMessage: messageExtrinsic});

await sendTransaction(voucherExtrinsic, pair, ['UserMessageSent']);
```

Deletion of a signless session in this mode relies on the balance of the user's main account (or can wait the session expiration).

## Program Verification with Schnorrkel Library

The program utilizes the [Schnorrkel library](https://docs.rs/schnorrkel/latest/schnorrkel/) for signature verification. This library supports Schnorr signatures using the Ristretto group, providing a secure cryptographic framework.

### Data Structure for Signature Verification

Signatures are verified against a structured format:

```rust
pub struct SignatureData {
    pub key: ActorId,
    pub duration: u64,
    pub allowed_actions: Vec<ActionsForSession>,
}
```

This structure includes a key (unique actor identifier), duration (validity period), and allowed_actions (list of permitted actions).

### Signature Verification Process

The program function receives the signature data (key, duration, allowed_actions) and the signature itself, along with the public key of the signer. It first reconstructs the payload that was signed by the user, serializing the `SignatureData` struct into a byte format and framing it with predefined prefixes and postfixes.

```rust
let mut combined_message = Vec::new();
combined_message.extend_from_slice(b"<Bytes>");
combined_message.extend_from_slice(&message);
combined_message.extend_from_slice(b"</Bytes>");
```

The signature and public key are then processed for verification against the signing context, ensuring message integrity.

```rust
const SIGNING_CONTEXT: &[u8] = b"substrate";
fn verify_signature(
    key: ActorId,
    duration: u64,
    allowed_actions: Vec<ActionsForSession>,
    signature: Vec<u8>,
    pub_key: ActorId
) {
    ...
    
    let signature = schnorrkel::Signature::from_bytes(&signature).expect("Invalid signature format");
    let pub_key = schnorrkel::PublicKey::from_bytes(&pub_key.into()).expect("Invalid public key format");
    
    pub_key.verify_simple(
        SIGNING_CONTEXT, 
        &combined_message, 
        &signature
    ).expect("Signature verification failed");
}
```

This comprehensive approach allows for secure, signless interaction between the frontend of dApps and blockchain programs, enhancing user experience while maintaining high security and efficiency.
