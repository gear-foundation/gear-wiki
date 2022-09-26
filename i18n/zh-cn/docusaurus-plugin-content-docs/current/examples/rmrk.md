---
sidebar_label: RMRK NFT 标准
sidebar_position: 15
---

# RMRK NFT 标准

## 介绍

RMRK 是一个 NFT 协议，致力于在 Kusama 和 Polkadot 生态系统上建立一个标准的 NFT 跨链基础设施。[RMRK NFT 2.0](https://docs.rmrk.app/concepts) 概念被分为 RMRK Legos 和 RMRK 概念。Legos 是构成复杂用例和启用某些概念的基础。

RMRK legos 已经在 Gear 上实现：

- 嵌套的 NFTs：
    NFT 包含其他 RMRK NFT 的能力。
- 多资源 NFT：
NFT 能够根据它被加载的环境而改变其输出。

这篇文章解释了接口、数据结构、基本功能，并解释了它们的用途。源代码可在[GitHub](https://github.com/gear-dapps/RMRK)上找到。

## 逻辑
### 嵌套逻辑

嵌套 NFT 的概念是指 NFT 能够拥有其他 NFT。因此，NFT 的所有者不仅可以是一个账户或一个智能合约，也可以是另一个 NFT。
在通常的 NFT 标准中，NFT 所有者被存储为从 NFT id 到地址的映射：

```rust
BTreeMap<TokenId, ActorId>
```

在 RMRK NFT 标准中，我们通过以下方式存储代币的所有者：

```rust
BTreeMap<TokenId, RMRKOwner>

pub struct RMRKOwner {
    pub token_id: Option<TokenId>,
    pub owner_id: ActorId,
}

```

如果 NFT 的所有者是另一个 NFT，那么字段 `token_id` 是 `Some(parent_token_id)` 并且 `owner_id` 是父 RMRK 合约的地址，否则 `token_id` 是 `None` 并且 `owner_id` 是地址一个帐户或另一个智能合约。

RMRK NFT 代币具有 `owner`和`rootowner`的概念。 `Rootowner` 将始终是一个帐户或程序，在 NFT 拥有另一个 NFT 的情况下，所有者也可以是 NFT ID。例如，如果 Alice 拥有`NFT A`，而`NFT A`又拥有`NFT B`，那么`NFT B`的`owner`就是`NFT A`，`NFT B`的`rootowner`就是 Alice。

RMRK 标准有 2 种铸造代币的选项。第一个类似于通常 NFT 标准中的 `mint` 函数：

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

第二个`mint`函数允许你创建一个属于另一个 NFT（或成为另一个 NFT 的子代）的 NFT：

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

当创建一个属于另一个 NFT 的代币时，合约会向 RMRK 合约的父级发送消息 `AddChild`：

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

根所有者或被批准的账户可以通过发送以下信息接受子 NFT。

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

或拒绝带有该信息的子 NFT：

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

根所有者也可以从他的 NFT 接受子节点中移除已经被接受的子节点：

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

如果根所有者拒绝或移除子 NFT，则必须从子 NFT 合约中销毁子 NFT。父 NFT 合约向子 NFT 合约发送相应消息：

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

被销毁的代币也可能在其他合约中有子代。销毁时，它会递归地销毁所有子代 NFT。

root 拥有者也可以使用以下消息销毁 NFT：
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

除了递归地销毁代币外，它还检查销毁的 NFT 是否属于另一个 NFT。在这种情况下，有必要通过下面的消息从父合约的子列表中删除代币：

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

当 NFT 转移时，目的地可以是一个账户，也可以是另一个 NFT。要将 NFT 发送到另一个帐户，需要发送一条消息：

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

如果之前的所有者是另一个 NFT，它会向父合约发送消息 `BurnChild`。

如果将代币转移到另一个 NFT，则会发送以下消息：

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

在这种情况下，有 5 种可能的情况：

1. 根所有者在一份合约中将子代币从 NFT 转移到他的另一个 NFT。
在这种情况下，子 RMRK 合约向父 RMRK 合约发送消息 `TransferChild`，并带有指示的先前`TokenId`和新的`TokenId`：

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

2. 根所有者将子代币从一个合约中的 RMRK 父代币转移到另一个合约中的 RMRK 代币：
    - 子 RMRK 合约发送消息`BurnChild`给前一个父 RMRK 合约
    - 子 RMRK 合约发送消息`AddAcceptedChild`给新的父 RMRK 合约

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

3. 根所有者将子代币转移到属于另一个根账户的 RMRK 代币：
    - 子 RMRK 合约向之前的父 RMRK 合约发送消息`BurnChild`；
    - 子 RMRK 合约向新的父 RMRK 合约发送消息`AddChild`；

4. 转移的 RMRK 代币直接属于根所有者，他将 RMRK 代币转移到他的另一个 RMRK 代币：子 RMRK 合约向新的父 RMRK 合约发送消息 `AddAcceptedChild`。

5. 转移的 RMRK 代币直接属于根所有者，他将 RMRK 代币转移到另一个他不拥有的 RMRK 代币：子 RMRK 合约向新的父 RMRK 合约发送消息 `AddChild`。

RMRK NFT 标准中的 `approve` 函数类似于通常的 nft 标准函数，不同之处在于 `msg::source` 必须是 `root_owner`：

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

### 多资源逻辑

Multi Resource NFT 标准是 RMRK 概念的独立部分。其思想是一个 NFT 可以有多个资源。

NFT 多资源有四个关键用例：

- *跨元宇宙兼容性*：例如，具有多种资源的 NFT 可以在不同的游戏中使用。

- *多媒体输出*：NFT 可以存储为不同的数字格式（图像、视频、音频、电子书或文本文件）。

- *媒体冗余*:许多 nft 的元数据集中在某个服务器上，或者在某些情况下，硬编码的 IPFS 网关也可能宕机，而不仅仅是 IPFS hash。通过添加相同的元数据文件作为不同的资源，元数据及其引用的媒体的弹性会成倍增加，因为所有协议同时瘫痪的可能性会越来越小。

- *NFT 进化*：许多 NFT，尤其是与游戏相关的 NFT，都需要进化。

RMRK 合约可以创建一个合约来存储它的资源。

#### **资源存储合约**

存储状态：

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

要向代币添加资源，RMRK 合约必须发送以下消息：

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

要获取有关存储中是否存在此类资源的信息，请发送消息：

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

#### **RMRK 合约中的多资源**

RMRK 合约管理员可以通过 RMRK 合约向存储合约添加资源：

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

任何人都可以用 propose-commit 模式的形式向现有代币添加资源。将资源添加到代币时，首先将其放在"Pending"数组中，并且必须由代币所有者迁移到"Active"数组中：

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

要接受资源，根所有者必须发送消息：

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

或使用以下消息拒绝资源：

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

NFT 多个资源按根所有者设置的优先级排序：

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

## 源码

RMRK 的实现在 [GitHub](https://github.com/gear-dapps/RMRK)。

更多关于在 Gear 上测试智能合约的细节，请参考这篇文章：[应用测试](https://wiki.gear-tech.io/zh-cn/developing-contracts/testing/)。
