---
sidebar_position: 21
---


# Claim Storage

## Introduction

This smart contracts example created by Gear represents a Simple Claim storage.

It is simple storage operating with Claims. A claim is a basic structure that states some facts about a subject. A claim can be issued by a subject, or any other issuer on behalf of the subject (e.g. a university might issue the claim that a subject has successfully graduated).
Whenever a claim is issued it MUST be signed by an issuer (or a subject in case he issues it on behalf of himself).

Every other contract user can verify any claim with his public key and a signature or check the claim data using one of the claim set's hashes (more detail below).

The basic stored value inside the contract is a claim:
```rust
/// Typings for u8 arrays.
pub type PublicKey = [u8; 32];
pub type Signature = [u8; 64];
pub type PieceId = u128;

/// ClaimData represents an internal data stored inside a claim.
#[derive(Decode, Encode, TypeInfo, Debug, Clone, PartialEq)]
pub struct ClaimData {
    /// Set of hashed data (e.g. BTreeSet::from([city], [street])).
    pub hashed_info: BTreeSet<[u8; 32]>,
    /// Date of issuance of this claim.
    pub issuance_date: u128,
    /// Validation status of the claim.
    pub valid: bool,
}

/// Claim is a main object stored inside the identity storage.
/// Consists of the claim data and all the public keys and signatures.
///
/// # Requirements:
/// * all public keys and signatures MUST be non-zero arrays
#[derive(Decode, Encode, TypeInfo, Debug, Clone, PartialEq)]
pub struct Claim {
    /// Issuer's  public key (e.g. who issued the claim). Can be equal to subject keys
    /// if the subject issues any claim about himself.
    pub issuer: PublicKey,
    /// Issuer's signature with the issuer keypair.
    pub issuer_signature: Signature,
    /// Subject's public key.
    pub subject: PublicKey,
    /// Map of verifiers PublicKey -> Signature
    pub verifiers: BTreeMap<PublicKey, Signature>,
    /// Internal data of the claim
    pub data: ClaimData,
}
```

Internally claim contains an issuance date, a validity status, and a set of hashed data. The set is used the following way. Say, one wants to store his address: Netherlands, Amsterdam, Museumplein, 6, 1071. This is okay if the user wants to be able to verify the full address. But if a user wants only to verify that he lives in Amsterdam? Should there be another claim created? The answer is no. A user simply breaks his address and hashed every value separately and then passes it as a set. The check procedure is done against the whole set, so one can now verify he lives in Amsterdam without disclosing the full address.

### Init Config
To successfully initialize a claim storage contract one should just send an `InitIdentity` message.

```rust
/// Initializes an identity storage.
#[derive(Decode, Encode, TypeInfo)]
pub struct InitIdentity {
}

```

### `Action` Structure
```rust

#[derive(Debug, Decode, Encode, TypeInfo)]
pub enum IdentityAction {
    /// Issues a new claim either by a subject himself
    /// or by an issuer on behalf of the subject
    ///
    /// # Requirements:
    /// * all public keys and signatures MUST be non-zero arrays
    IssueClaim {
        /// Issuer's public key.
        issuer: PublicKey,
        /// Issuer's signature with his keypair.
        issuer_signature: Signature,
        /// Subject's public key.
        subject: PublicKey,
        /// Claim's data.
        data: ClaimData,
    },
    /// Changes a validation status of the claim.
    /// Can only be performed by a subject or an issuer of the claim.
    ///
    /// # Requirements:
    /// * all public keys and signatures MUST be non-zero arrays
    ChangeClaimValidationStatus {
        /// Validator's public key. Can be either a subject's or an issuer's one.
        validator: PublicKey,
        /// Subject's public key.
        subject: PublicKey,
        /// Claim's id.
        piece_id: PieceId,
        /// New status of the claim.
        status: bool,
    },
    /// Verify a specific claim with a public key and a signature.
    /// Can not be performed by an issuer or a subject.
    ///
    /// # Requirements:
    /// * all public keys and signatures MUST be non-zero arrays
    VerifyClaim {
        /// Verifier's public key.
        verifier: PublicKey,
        /// Verifier's signature.
        verifier_signature: Signature,
        /// Subject's public key.
        subject: PublicKey,
        /// Claim's id.
        piece_id: PieceId,
    },
}
```
As the corresponding event structure:
```rust
#[derive(Debug, Decode, Encode, TypeInfo)]
pub enum IdentityEvent {
    ClaimIssued {
        /// Issuer's public key.
        issuer: PublicKey,
        /// Subject's public key.
        subject: PublicKey,
        /// Claim's id generated automatically.
        piece_id: PieceId,
    },
    ClaimValidationChanged {
        /// Validator's public key.
        validator: PublicKey,
        /// Subjects's public key.
        subject: PublicKey,
        /// Claims' id.
        piece_id: PieceId,
        /// Claim's new validation status.
        status: bool,
    },
    VerifiedClaim {
        /// Verifier's public key.
        verifier: PublicKey,
        /// Subject's public key.
        subject: PublicKey,
        /// Claim's id.
        piece_id: PieceId,
    },
}
```

### `State` Query & Replies
```rust
#[derive(Debug, Decode, Encode, TypeInfo)]
pub enum IdentityStateQuery {
    /// Get all the claims for a specified public key.
    ///
    /// Arguments:
    /// `PublicKey` - is the public key of a user whose claims are queried
    UserClaims(PublicKey),
    /// Get a specific claim with the provided public key and a claim id.
    ///
    /// Arguments:
    /// `PublicKey` - is the public key of a user whose claim is queried
    /// `PieceId` - is the claim id
    Claim(PublicKey, PieceId),
    /// Get all the verifiers' public keys for a corresponding claim.
    ///
    /// Arguments:
    /// `PublicKey` - is the public key of a user whose claim is queried
    /// `PieceId` - is the claim id
    Verifiers(PublicKey, PieceId),
    /// Get claim's validation status.
    ///
    /// Arguments:
    /// `PublicKey` - is the public key of a user whose claim is queried
    /// `PieceId` - is the claim id
    ValidationStatus(PublicKey, PieceId),
    /// Get claim's issuance date.
    ///
    /// Arguments:
    /// `PublicKey` - is the public key of a user whose claim is queried
    /// `PieceId` - is the claim id
    Date(PublicKey, PieceId),
    /// Check the claim with a hash from it's data set.
    ///
    /// Arguments:
    /// `PublicKey` - is the public key of a user whose claim is queried
    /// `PieceId` - is the claim id
    /// `[u8; 32]` - is the hash being queried.
    /// If it is in the claim hashed_info set then true is returned. Otherwise - false.
    CheckClaim(PublicKey, PieceId, [u8; 32]),
}

#[derive(Debug, Decode, Encode, TypeInfo)]
pub enum IdentityStateReply {
    UserClaims(BTreeMap<PieceId, Claim>),
    Claim(Option<Claim>),
    Verifiers(Vec<PublicKey>),
    ValidationStatus(bool),
    Date(u64),
    CheckedClaim(PublicKey, PieceId, bool),
}
```
**Note**: the actual function performing a check is in the state (query & reply) since it does not modify state. Keeping it in state will also facilitate it's usage outside of the contract.


### Functions
According the actions/events provided there is a need in 4 functions:
```rust
    /// Creates a new claim.
    ///
    /// # Requirements:
    /// * all the public keys and signatures MUST be non-zero.
    ///
    /// # Arguments:
    /// * `issuer` - the claim issuer's public key.
    /// * `issuer_signature` - the corresponding signature with the `issuer` public key.
    /// * `subject`- the subject's public key.
    /// * `data` - claim's data.
    fn issue_claim(
        &mut self,
        issuer: PublicKey,
        issuer_signature: Signature,
        subject: PublicKey,
        data: ClaimData,
    ) {
        self.user_claims.entry(subject).or_default().insert(
            self.piece_counter,
            Claim {
                issuer,
                issuer_signature,
                subject,
                verifiers: BTreeMap::new(),
                data,
            },
        );

        msg::reply(
            IdentityEvent::ClaimIssued {
                issuer,
                subject,
                piece_id: self.piece_counter,
            },
            0,
        )
        .expect("IDENTITY: Error during replying with IdentityEvent::ClaimIssued");

        self.piece_counter += 1;
    }

    /// Changes claim's validation status.
    ///
    /// # Requirements:
    /// * all the public keys and signatures MUST be non-zero.
    ///
    /// # Arguments:
    /// * `validator` - the claim issuer's or subject's public key.
    /// * `subject`- the subject's public key.
    /// * `piece_id` - claim's id.
    /// * `status` - new claim's status.
    fn change_validation_status(
        &mut self,
        validator: PublicKey,
        subject: PublicKey,
        piece_id: PieceId,
        status: bool,
    ) {
        let data_piece = self
            .user_claims
            .get(&subject)
            .expect("The user has no claims")
            .get(&piece_id)
            .expect("The user has not such claim with the provided piece_id");
        if data_piece.subject != validator && data_piece.issuer != validator {
            panic!("IDENTITY: You can not change this claim");
        }
        self.user_claims
            .entry(subject)
            .or_default()
            .entry(piece_id)
            .and_modify(|claim| claim.data.valid = status);

        msg::reply(
            IdentityEvent::ClaimValidationChanged {
                validator,
                subject,
                piece_id,
                status,
            },
            0,
        )
        .expect("IDENTITY: Error during replying with IdentityEvent::ClaimValidationChanged");
    }

    /// Verifies the claim.
    ///
    /// # Requirements:
    /// * all the public keys and signatures MUST be non-zero.
    /// * `verifier` - MUST differ from the claim's subject or issuer.
    ///
    /// # Arguments:
    /// * `verifier` - the claim verifier's public key.
    /// * `verifier_signature` - the corresponding signature with the `verifier` public key.
    /// * `piece_id` - claim's id.
    /// * `subject` - subject's public key.
    fn verify_claim(
        &mut self,
        verifier: PublicKey,
        verifier_signature: Signature,
        subject: PublicKey,
        piece_id: PieceId,
    ) {
        let piece = self
            .user_claims
            .get(&subject)
            .expect("The user has no claims")
            .get(&piece_id)
            .expect("The user has not such claim with the provided piece_id");
        if piece.issuer == verifier || piece.subject == verifier {
            panic!("IDENTITY: You can not verify this claim");
        }
        self.user_claims
            .entry(subject)
            .or_default()
            .entry(piece_id)
            .and_modify(|claim| {
                claim.verifiers.insert(verifier, verifier_signature);
            });
        msg::reply(
            IdentityEvent::VerifiedClaim {
                verifier,
                subject,
                piece_id,
            },
            0,
        )
        .expect("IDENTITY: Error during replying with IdentityEvent::VerifiedClaim");
    }
```

### Testing
Though the contract is not that complicated itself, we strongly suggest you check the tests. In there provided tests we show a user actually interacts with the contract (e.g. keypairs/signature and hashing).

## Conclusion
A source code of the contract example provided by Gear is available on GitHub: [`identity/src/lib.rs`](https://github.com/gear-dapps/identity/blob/master/src/lib.rs).

See also an example of the smart contract testing implementation based on gtest: [`concert/tests/concert_tests.rs`](https://github.com/gear-dapps/identity/blob/master/tests/concert_tests.rs).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
