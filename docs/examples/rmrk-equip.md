---
sidebar_label: RMRK Equip
sidebar_position: 16
---

# RMRK NFT standard

## Bases and Equippable NFTs

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
