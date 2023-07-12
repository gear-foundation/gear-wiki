---
sidebar_label: RMRK NFT standard
sidebar_position: 16
---

# RMRK NFT standard

## Introduction
RMRK is an NFT protocol dedicated to establishing a standard NFT cross-chain infrastructure on the Kusama and Polkadot ecosystems. The [RMRK NFT 2.0 Concepts](https://docs.rmrk.app/concepts) are divided into RMRK legos and RMRK concepts. Legos are primitives that make up complex use cases and enable certain concepts.
RMRK legos that are already implemented on Gear:
- Nested NFTs:
    The ability for any NFT to contain other RMRK NFT.
- Multi-resource NFTs:
The ability for an NFT to vary its output depending on the context it is being loaded in.

This article explains the programming interface, data structure, basic functions and explains their purpose. The source code is available on [GitHub](https://github.com/gear-foundation/dapps-RMRK).

## Logic
### Nesting logic
The concept of nested NFTs refers to NFTs being able to own other NFTs. So, the NFT owner can be not only an account or a smart contract, but also another NFT.

In the usual NFT standard, NFT owners were stored as mapping from the NFT ids to addresses:
```rust
BTreeMap<TokenId, ActorId>
```
In the RMRK NFT standard we store the owners of tokens in the following way:
```rust
BTreeMap<TokenId, RMRKOwner>

pub struct RMRKOwner {
    pub token_id: Option<TokenId>,
    pub owner_id: ActorId,
}

```

If the owner of NFT is another NFT then the field `token_id` is `Some(parent_token_id)` and the `owner_id` is the address of the parent RMRK contract, otherwise `token_id` is `None` and `owner_id` is the address of an account or another smart contract.

RMRK NFT tokens have the concept of `owner` and `rootowner`. `Rootowner` will always be an account or program where owner can also be an NFT ID in cases where an NFT owns another NFT. For example, if Alice owns `NFT A` which owns `NFT B` then the `owner` of `NFT B` is `NFT A` and the `rootowner` of `NFT B` is Alice.

RMRK standard has 2 options of minting tokens. The first one is similar to the `mint` function at usual NFT standard:

```rust
/// Mints token to the user or program.
///
/// # Requirements:
/// * The `token_id` must not exist.
/// * The `to` address should be a non-zero address.
///
/// # Arguments:
/// * `to`: is the address who will own the token.
/// * `token_id`: is the tokenId of the new RMRK token.
///
/// On success reply [`RMRKEvent::MintToRootOwner`].
MintToRootOwner {
    to: ActorId,
    token_id: TokenId,
},
```

The second `mint` function allows you to create an NFT that will belong to another NFT (or be a child of another NFT):

```rust
/// Mints token that will belong to another token in another RMRK contract.
///
/// # Requirements:
/// * The `parent_id`  must be a deployed RMRK contract.
/// * The token with id `parent_token_id` must exist in the `parent_id` contract.
/// * The `token_id` must not exist.
///
/// # Arguments:
/// * `parent_id`: is the address of the RMRK parent contract.
/// * `parent_token_id`: is the parent RMRK token.
/// * `token_id`: is the tokenId of the new RMRK token.
///
/// On success replies [`RMRKEvent::MintToNft`].
MintToNft {
    parent_id: ActorId,
    parent_token_id: TokenId,
    token_id: TokenId,
},
```

When creating a token that will belong to another NFT, the contract sends a message `AddChild` to parent the RMRK contract:

```rust
/// That message is designed to be send from another RMRK contracts
/// when minting an NFT(child_token_id) to another NFT(parent_token_id).
/// It adds a child to the NFT with tokenId `parent_token_id`
/// The status of added child is `Pending`.
///
/// # Requirements:
/// * Token with TokenId `parent_token_id` must exist.
/// * There cannot be two identical children.
///
/// # Arguments:
/// * `parent_token_id`: is the tokenId of the parent NFT.
/// * `child_token_id`: is the tokenId of the child instance.
///
/// On success replies [`RMRKEvent::PendingChild`].
AddChild {
    parent_token_id: TokenId,
    child_token_id: TokenId,
},
```
The root owner or the approved account can accept the child NFT by sending the following message:
```rust
/// Accepts an RMRK child being in the `Pending` status.
/// Removes RMRK child from `pending_children` and adds it to `accepted_children`.
///
/// # Requirements:
/// * The `msg::source()` must be an RMRK owner of NFT with tokenId `parent_token_id` or an approved account.
/// * The indicated NFT with tokenId `child_token_id` must exist in the pending array of `parent_token_id`.
///
/// # Arguments:
/// * `parent_token_id`: is the tokenId of the parent NFT
/// * `child_token_id`: is the tokenId of the child instance
///
/// On success replies [`RMRKEvent::AcceptedChild`].
AcceptChild {
    parent_token_id: TokenId,
    child_contract_id: ActorId,
    child_token_id: TokenId,
},
```

or reject the child NFT with the message:
```rust
/// Rejects an RMRK child being in the `Pending` status.
/// It sends a message to the child NFT contract to burn the NFT token from it.
///
/// # Requirements:
/// * The `msg::source()` must be an RMRK owner or an approved account.
/// * The indicated NFT with tokenId `child_token_id` must exist in the pending array of `parent_token_id`.
///
/// Arguments:
/// * `parent_token_id`: is the tokenId of the parent NFT.
/// * `child_contract_id`: is the address of the child RMRK contract.
/// * `child_token_id`: is the tokenId of the child instance.
///
/// On success replies [`RMRKEvent::RejectedChild`].
RejectChild {
    parent_token_id: TokenId,
    child_contract_id: ActorId,
    child_token_id: TokenId,
},
```

The root owner can also remove the already accepted child from his NFT accepted children:
```rust
/// Removes an RMRK child being in the `Accepted` status.
/// It sends a message to the child NFT contract to burn the NFT token from it.
///
/// # Requirements:
/// * The `msg::source()` must be an RMRK owner or an approved account.
///
/// # Arguments:
/// * `parent_token_id`: is the tokenId of the parent NFT.
/// * `child_contract_id`: is the address of the child RMRK contract.
/// * `child_token_id`: is the tokenId of the child instance.
///
/// On success replies [`RMRKEvent::RemovedChild`].
RemoveChild {
    parent_token_id: TokenId,
    child_contract_id: ActorId,
    child_token_id: TokenId,
},
```
If the root owner rejects  or removes the child NFT, the child NFT must be burnt from the child NFT contract. The parent NFT contract sends the corresponding message to the child NFT contract:

```rust
/// Burns RMRK tokens. It must be called from the RMRK parent contract when the root owner removes or rejects child NFTs.
/// The input argument is an `BTreeSet<TokenId>` since a parent contract can have multiple children that must be burnt.
/// It also recursively sends messages [`RMRKAction::BurnFromParent`] to children of burnt tokens if any.
///
/// # Requirements:
/// * The `msg::source()` must be a RMRK parent contract.
/// * All tokens in `BTreeSet<TokenId>` must exist.
///
/// # Arguments:
/// * `token_ids`: is the tokenIds of the burnt tokens.
///
/// On success replies [`RMRKEvent::TokensBurnt`].
BurnFromParent {
    child_token_ids: BTreeSet<TokenId>,
    root_owner: ActorId,
},
```
The token being burned may also have children in other contracts. When burned, it recursively burns all the children's NFTs.

The root owner can also burn the NFT with following message:
```rust
/// Burns RMRK token.
/// It recursively burns all the children's NFTs.
/// It checks whether the token is a child of another token.
/// If so, it sends a message to the parent NFT  to remove the child.
///
/// # Requirements:
/// * The `msg::source()` must be the root owner of the token.
///
/// # Arguments:
/// * `token_id`: is the tokenId of the burnt token.
///
/// On success replies [`RMRKEvent::Transfer`].
Burn(TokenId),
```
In addition to burning tokens recursively, it also checks whether the burnt NFT belongs to another NFT. In that case, it is necessary to remove the token from the children list in the parent's contract with the following message:

```rust
/// Burns a child of NFT.
/// That function must be called from the child RMRK contract during `transfer`, `transfer_to_nft` and `burn` functions.
///
/// # Requirements:
/// * The `msg::source()` must be a child RMRK contract.
/// * The indicated child must exist on the children list of `parent_token_id`.
///
/// # Arguments:
/// * `parent_token_id`: is the tokenId of the parent NFT.
/// * `child_token_id`: is the tokenId of the child instance.
///
/// On success replies [`RMRKEvent::ChildBurnt`].
BurnChild {
    parent_token_id: TokenId,
    child_token_id: TokenId,
},
```

When NFT is transferred, the destination can be either an account or another NFT. To send an NFT to another account you need to send a message:
```rust
/// Transfers NFT to another account.
/// If the previous owner is another RMRK contract, it sends the message [`RMRKAction::BurnChild`] to the parent contract.
///
/// # Requirements:
/// * The `token_id` must exist.
/// * The `msg::source()` must be approved by the owner of the token.
/// * The `to` address should be a non-zero address.
///
/// # Arguments:
/// * `to`: is the receiving address.
/// * `token_id`: is the tokenId of the transferred token.
///
/// On success replies [`RMRKEvent::ChildBurnt`].
Transfer {
    to: ActorId,
    token_id: TokenId,
},
```
If the previous owner is another NFT it sends a message `BurnChild` to the parent contract.

In case of transferring a token to another NFT, the following message is sent:
```rust
/// Transfers NFT to another NFT.
///
/// # Requirements:
/// * The `token_id` must exist.
/// * The `msg::source()` must be approved by the root owner of the token.
/// * The `to` address should be a non-zero address
///
/// # Arguments:
/// * `to`: is the address of the new parent RMRK contract.
/// * `destination_id: is the tokenId of the parent RMRK token.
/// * `token_id`: is the tokenId of the transferred token.
///
/// On success replies [`RMRKEvent::TransferToNft`].
TransferToNft {
    to: ActorId,
    token_id: TokenId,
    destination_id: TokenId,
},
```
In this case, 5 scenarios are possible:
1. Root owner transfers child token from NFT to another his NFT within one contract.
In that case child RMRK contract sends message `TransferChild` to parent RMRK contract with indicated previous `TokenId` and new `TokenId`:

```rust
/// That message is designed to be sent from another RMRK contracts
/// when the root owner transfers his child to another parent token within one contract.
/// If root owner transfers child token from NFT to another his NFT
/// it adds a child to the NFT  with a status that child had before.
/// If root owner transfers child token from NFT to another NFT that he does not own
/// it adds a child to the NFT  with a status `Pending`.
///
/// # Requirements:
/// * The `msg::source()` must be a child RMRK contract.
/// * The `to` must be an existing RMRK token
/// * The `root_owner` of `to` and `from` must be the same.
///
/// # Arguments:
/// * `from`: RMRK token from which the child token will be transferred.
/// * `to`: RMRK token to which the child token will be transferred.
/// * `child_token_id`: is the tokenId of the child in the RMRK child contract.
///
/// On success replies [`RMRKEvent::ChildTransferred`].
TransferChild {
    from: TokenId,
    to: TokenId,
    child_token_id: TokenId,
},
```
2. Root owner transfers child token from RMRK parent token in one contract to another his RMRK token in another contract:
    - Child RMRK contract sends message `BurnChild` to previous parent RMRK contract;
    - Child RMRK contract sends message `AddAcceptedChild` to new parent RMRK contract;
```rust
/// That function is designed to be called from another RMRK contracts
/// when the root owner transfers his child NFT to another his NFT in another contract.
/// It adds a child to the RMRK token with tokenId `parent_token_id` with status `Accepted`.
///
/// # Requirements:
/// * The `msg::source()` must be a child RMRK contract.
/// * The `parent_token_id` must be an existing RMRK token that must have `child_token_id` in its `accepted_children`.
///
/// # Arguments:
/// * `parent_token_id`: RMRK token to which the child token will be transferred.
/// * `child_token_id`: is the tokenId of the child of the RMRK child contract.
///
/// On success replies [`RMRKEvent::AcceptedChild`].
AddAcceptedChild {
    parent_token_id: TokenId,
    child_token_id: TokenId,
},
```
3. Root owner transfers child token to RMRK token that belongs to another root account:
    - Child RMRK contract sends message `BurnChild` to previous parent RMRK contract;
    - Child RMRK contract sends message `AddChild` to new parent RMRK contract;
4. Transferred RMRK token belongs directly to root owner and he transfers RMRK token to his another RMRK token: child RMRK contract sends message `AddAcceptedChild` to new parent RMRK contract.
5. Transferred RMRK token belongs directly to root owner and he transfers RMRK token to another RMRK token that he doesn’t own: child RMRK contract sends message `AddChild` to new parent RMRK contract.

The `approve` function in RMRK NFT standard is similar to the usual nft standard function, except that `msg::source` must the `root_owner`:
```rust
/// Approves an account to transfer NFT.
///
/// # Requirements:
/// * The `token_id` must exist.
/// * The `msg::source()` must be approved by the root owner of the token.
/// * The `to` address must be a non-zero address
///
/// # Arguments:
/// * `to`: is the address of the approved account.
/// * `token_id`: is the tokenId of the token.
///
/// On success replies [`RMRKEvent::Approval`].
Approve {
    to: ActorId,
    token_id: TokenId,
},
```
### Multiresource logic
The Multi Resource NFT standard is a standalone part of RMRK concepts. The idea is that an NFT can have multiple resources.
There are four key use cases for NFT multiresource:
- *Cross-metaverse compatibility*:  for example, NFT with several resources can be used in different games.
- *Multimedia output*: NFT can be stored in different digital formats (image, video, audio, eBooks or text file).
- *Media Redundancy*: many NFTs are minted with metadata centralized on a server somewhere or, in some cases, a hardcoded IPFS gateway which can also go down, instead of just an IPFS hash. By adding the same metadata file as different resources, the resilience of the metadata and its referenced media increases exponentially as the chances of all the protocols going down at once become ever less likely.
- *NFT Evolution*: many NFTs, particularly game related ones, require evolution.
RMRK contract can create a contract to store its resources.
#### **Resource storage contract:**
The storage state:
```rust
#[derive(Debug, Default)]
pub struct ResourceStorage {
    pub name: String,
    // the admin is the rmrk contract that initializes the storage contract
    pub admin: ActorId,
    pub resources: BTreeMap<u8, Resource>,
    pub all_resources: BTreeSet<Resource>,
}
```
To add resource to the token the RMRK contract must send the following message:
```rust
/// Adds resource entry on resource storage contract.
///
/// # Requirements:
/// * The `msg::source()` must be the contract admin (RMRK contract).
/// * `id` can not be equal to zero.
/// * Resource with indicated `id` must not exist.
///
/// # Arguments:
/// * `id`: is a resource identifier.
/// * `src`: a string pointing to the media associated with the resource.
/// * `thumb`: a string pointing to thumbnail media associated with the resource.
/// * `metadata_uri`:  a string pointing to a metadata file associated with the resource.
///
/// On success replies [`ResourceEvent::ResourceEntryAdded`].
AddResourceEntry {
    id: u8,
    src: String,
    thumb: String,
    metadata_uri: String,
},
```
To get information about whether such a resource exists in the storage or not, send the message:
```rust
/// Used to check from the RMRK contract whether the resource with indicated id exists or not.
///
/// # Arguments:
/// * `id`: is a resource identifier.
///
/// On success replies [`ResourceEvent::Resource`].
GetResource {
    id: u8,
},
```

#### **MultiResource in RMRK contract:**
The RMRK contract admin can add resource to the storage contract through the RMRK contract:
```rust
/// Adds resource entry on resource storage contract.
/// It sends a message to the resource storage contract with information about a new resource.
///
/// # Requirements:
/// * The `msg::source()` must be the contract admin.
///
/// Arguments:
/// * `id`: is a resource identifier
/// * `src`: a string pointing to the media associated with the resource.
/// * `thumb`: a string pointing to thumbnail media associated with the resource.
/// * `metadata_uri`:  a string pointing to a metadata file associated with the resource.
///
/// On success reply `[RMRKEvent::ResourceEntryAdded]`.
AddResourceEntry {
    id: u8,
    src: String,
    thumb: String,
    metadata_uri: String,
},
```
Anyone can add resource to the existing token in the form of a propose-commit pattern. When adding a resource to a token, it is first placed in the "Pending" array, and must be migrated to the "Active" array by the token owner:
```rust
/// Adds resource to an existing token.
/// Checks that the resource with indicated id exists in the resource storage contract.
/// Proposed resource is placed in the "Pending" array.
/// A pending resource can be also proposed to overwrite an existing resource.
///
/// # Requirements
/// Token with indicated `token_id` must exist.
/// The proposed resource must not already exist for the token.
/// The resource that is proposed to be overwritten must exist for the token.
/// The length of resources in pending status must be less or equal to `MAX_RESOURCE_LEN`.
///
/// # Arguments:
/// * `token_id`: an id of the token.
/// * `resource_id`: a proposed resource.
/// * `overwrite_id`: a resource to be overwritten.
///
/// On success reply `[RMRKEvent::ResourceAdded]`.
AddResource {
    token_id: TokenId,
    resource_id: u8,
    overwrite_id: u8,
},
```
To accept resource the root owner must send the message:
```rust
/// Accepts resource from pending list.
/// Moves the resource from the pending array to the accepted array.
///
/// # Requirements
/// Only root owner or approved account can accept a resource.
/// `resource_id` must exist for the token in the pending array.
///
/// # Arguments:
/// * `token_id`: an id of the token.
/// * `resource_id`: a resource to be accepted.
///
/// On success reply  `[RMRKEvent::ResourceAccepted]`.
AcceptResource {
    token_id: TokenId,
    resource_id: u8,
},
```
or reject resource with the message:
```rust
/// Rejects a resource, dropping it from the pending array.
///
/// # Requirements
/// Only root owner or approved account can reject a resource.
/// `resource_id` must exist for the token in the pending array.
///
/// # Arguments:
/// * `token_id`: an id of the token.
/// * `resource_id`: a resource to be rejected.
///
/// On success reply  `[RMRKEvent::ResourceRejected]`.
RejectResource {
    token_id: TokenId,
    resource_id: u8,
},
```

An NFT multiple resources are ordered by priority that is set by the root owner:
```rust
/// Sets the priority of the active resources array
/// Priorities have a 1:1 relationship with their corresponding index in
/// the active resources array. E.G, a priority array of [1, 3, 2] indicates
///  that the the active resource at index 1 of the active resource array
///  has a priority of 1, index 2 has a priority of 3, and index 3 has a priority
///  of 2. There is no validation on priority value input; out of order indexes
///  must be handled by the frontend.
///
/// # Requirements
/// Only root owner or approved account can set priority
/// The length of the priorities array must be equal to the present length of the active resources array
///
/// # Arguments:
/// * `token_id`: an id of the token.
/// * `priorities`: An array of priorities to set.
///
/// On success reply `[RMRKEvent::PrioritySet]`.
SetPriority {
    token_id: TokenId,
    priorities: Vec<u8>,
},
```

### Bases and Equippable NFTs
That functionality allows NFTs to equip owned NFTs in order to gain extra utility or change their appearance. It is also known as composable NFTs.
Resources are divided into three types:
* Basic:
```rust
#[derive(Debug, Default, Clone, Encode, Decode, TypeInfo)]
pub struct BasicResource {
    /// URI like ipfs hash
    pub src: String,

    /// If the resource has the thumb property, this will be a URI to a thumbnail of the given
    /// resource.
    pub thumb: Option<String>,

    /// Reference to IPFS location of metadata
    pub metadata_uri: String,
}
```
* Composable:
```rust
#[derive(Debug, Default, Clone, Encode, Decode, TypeInfo)]
pub struct ComposedResource {
    /// URI like ipfs hash
    pub src: String,

    /// If the resource has the thumb property, this will be a URI to a thumbnail of the given
    /// resource.
    pub thumb: String,

    /// Reference to IPFS location of metadata
    pub metadata_uri: String,

    // The address of base contract
    pub base: BaseId,

    //  If a resource is composed, it will have an array of parts that compose it
    pub parts: Parts,
}
```
* Slot:
```rust
#[derive(Debug, Default, Clone, Encode, Decode, TypeInfo)]
pub struct SlotResource {
    /// URI like ipfs hash
    pub src: String,

    /// If the resource has the thumb property, this will be a URI to a thumbnail of the given
    /// resource.
    pub thumb: String,

    /// Reference to IPFS location of metadata
    pub metadata_uri: String,

    // The address of base contract
    pub base: BaseId,

    /// If the resource has the slot property, it was designed to fit into a specific Base's slot.
    pub slot: SlotId,
}
```

Base contract is a catalogue of parts from which an NFT can be composed. If resource is `Composable` or `Slot` then it refers to `base` contract that contains the information about parts.
The base contract state:
```rust
#[derive(Debug, Default, Encode, Decode, TypeInfo)]
pub struct Base {
    /// Original creator of the Base.
    /// Issuer can add, modify or remove parts from Base.
    pub issuer: ActorId,

    /// Specifies how an NFT should be rendered(svg, audio, mixed, video, png).
    pub base_type: String,

    /// Provided ny user during Base creation.
    pub symbol: String,

    /// Mapping from `PartId` to `Part`.
    pub parts: BTreeMap<PartId, Part>,
}
```
Parts can be `Fixed` or `Slot`:
```rust
#[derive(Debug, Clone, Default, Encode, Decode, TypeInfo)]
pub struct FixedPart {
    /// A unique identifier.
    pub id: PartId,

    /// An optional zIndex of base part layer.
    /// specifies the stack order of an element.
    /// An element with greater stack order is always in front of an element with a lower stack order.
    pub z: Option<ZIndex>,

    /// An IPFS Uri pointing to main media file of this part.
    pub src: String,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub struct SlotPart {
    /// A unique identifier.
    pub id: PartId,

    /// Array of whitelisted collections that can be equipped in the given slot. Used with slot parts only.
    pub equippable: EquippableList,

    /// An optional zIndex of base part layer.
    /// specifies the stack order of an element.
    /// An element with greater stack order is always in front of an element with a lower stack order.
    pub z: Option<ZIndex>,

    /// An optional IPFS Uri pointing to main media file of this part.
    pub src: Option<String>,
}
```
The messages that the Base contract handles:
```rust
#[derive(Debug, Decode, Encode, TypeInfo)]
pub enum BaseAction {
/// Adds parts to base contract.
///
/// # Requirements:
/// * The `msg::source()` must be the contract issuer.
/// * `PartId` must be unique.
///
/// # Arguments:
/// * `BTreeMap<PartId, Part>`: a mapping from `PartId` to fixed or slot `Part`.
///
/// On success replies `[BaseEvent::PartsAdded]`.
AddParts(BTreeMap<PartId, Part>),

/// Adds equippable to slot part.
///
/// # Requirements:
/// * The `msg::source()` must be the contract issuer.
/// * The indicated collection contract must be RMRK contract.
/// * The token from indicated collections must have composable resource that refers to that base.
///
/// # Arguments:
/// * `collection_id`: an address of RMRK contract.
/// * `token_id`: the id of the token in RMRK contract.
///
/// On success replies `[BaseEvent::EquippableAdded]`.
AddEquippable {
    collection_id: CollectionId,
    token_id: TokenId,
},

/// Removes parts from the base.
///
/// # Requirements:
/// * The `msg::source()` must be the contract issuer.
/// * The parts with indicated PartIds must exist.
///
/// # Arguments:
/// * `Vec<PartId>`: Part IDs to be removed.
///
/// On success replies `[BaseEvent::PartsRemoved]`.
RemoveParts(Vec<PartId>),

/// Removes equippable from the slot part.
///
/// # Requirements:
/// * The `msg::source()` must be the contract issuer.
/// * Indicated equippable must exist.
///
/// # Arguments:
/// * `collection_id`: an address of RMRK contract.
/// * `token_id`: the id of the token in RMRK contract.
///
/// On success replies `[BaseEvent::EquippableRemoved]`.
RemoveEquippable {
    collection_id: CollectionId,
    token_id: TokenId,
},

/// Checks whether the part exists in the Base.
///
/// # Arguments:
/// * `PartId`: the Part Id.
///
/// On success replies `[BaseEvent::Part]`.
CheckPart(PartId),
}
```

The RMRK contract logic is extended with the following messages:
 ```rust
/// Equip a child NFT's resource to a parent's slot.
/// It sends message to the child contract
/// to check whether the child token has the indicated slot resource.
///
/// # Requirements:
/// * The `msg::source()` must be the root owner.
/// * The child token must have the slot resource with indicated `base_id` and `slot_id`.
/// * The parent token must have composed resource with indicated `base_id`.
/// * The parent must not have the equippable with that child token.
///å
/// Arguments:
/// * `token_id`: the ID of the parent token (equippable token).
/// * `resource_id`: the resource id of the equippable token.
/// * `child_contract_id`: the child contract address.
/// * `child_token_id`: the id of the child token that will be equipped.
/// * `child_resource_id`: the resource id of the child token.
/// * `base_id`: the address of the base contract.
/// * `slot_id`: the id of the slot part in the base contract.
///
/// On success reply `[RMRKEvent::TokenEquipped]`.
Equip {
    token_id: TokenId,
    resource_id: ResourceId,
    child_contract_id: ActorId,
    child_token_id: TokenId,
    child_resource_id: ResourceId,
    base_id: BaseId,
    slot_id: SlotId,
},

/// Unequip a child NFT's resource from a parent's slot.
///
/// # Requirements:
/// * The `msg::source()` must be the root owner.
/// * The parent must have the equippable with that child token.
///
/// Arguments:
/// * `token_id`: the ID of the parent token (equippable token).
/// * `child_contract_id`: the child contract address.
/// * `child_token_id`: the id of the child token that will be equipped.
///
/// On success reply `[RMRKEvent::TokenUnequipped]`.
Unequip {
    token_id: TokenId,
    child_contract_id: ActorId,
    child_token_id: TokenId,
},
 ```
## Source code

The source code of RMRK implementation and the example of an implementation of its testing is available on [GitHub](https://github.com/gear-foundation/dapps-RMRK).


For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
