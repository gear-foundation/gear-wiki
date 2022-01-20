---
sidebar_label: 'DAO'
sidebar_position: 4
---

# 去中心化自治组织(DAO)

智能合约可以在 Github 上获得: https://github.com/gear-tech/apps/tree/master/dao

## 源文件

1. `erc20_functions.rs` - 包含 ERC20 合约的函数。DAO 合约通过 `transfer_tokens` 和 `balance` 函数同 ERC20 合约进行交互:

```rust
pub async fn transfer_tokens(
		&mut self,
		token_id: &ActorId, /// - ERC-20 合约地址
		from: &ActorId, /// - 发送方地址
		to: &ActorId, /// - 接收方地址
		amount: u128, /// - Token 数量
)
```

这个函数发送一个消息(这个 Action 在枚举 `TokenAction` 中定义)并接受返回结果(这个返回结果在枚举 `TokenEvent` 中定义):

```rust
	let transfer_response: TokenEvent = msg::send_and_wait_for_reply(
        *token_id, /// - ERC20 合约地址,
        TokenAction::Transfer(transfer_data), /// - ERC20 合约中的 Action
        exec::gas_available() - GAS_RESERVE,
        0,
    )
```

balance 函数也采用类似的方式定义:

```rust
pub async fn balance(
		&mut self,
		token_id: &ActorId, /// - ERC20 合约地址,
		account: &ActorId, /// - 账户地址
)
``` 
并发送消息:

```rust
let balance_response: TokenEvent = msg::send_and_wait_for_reply(
        *token_id, /// - ERC20 合约地址,
		TokenAction::BalanceOf(H256::from_slice(account.as_ref())) /// - ERC20 合约中的 Action
        exec::gas_available() - GAS_RESERVE,
        0,
    )
```

2. `payloads.rs` - 包含合约在返回时接收和发送的数据结构。

3. `lib.rs` - 定义了合约的逻辑。

## Structs

合约包含了以下结构:

```rust
struct Dao {
    admin: ActorId,
    approved_token_program_id: ActorId,
    period_duration: u64,
    voting_period_length: u64,
    grace_period_length: u64,
    dilution_bound: u128,
    abort_window: u64, 
    total_shares: u128,
    members: BTreeMap<ActorId, Member>,
    member_by_delegate_key: BTreeMap<ActorId, ActorId>,
    proposal_id: u128,
    proposals: BTreeMap<u128, Proposal>,
 	approved_list: Vec<ActorId>,
}
```

其中:

`admin` - 初始化 DAO 的成员。他拥有一份份额，可以提交新的提案和添加新的成员。

`approved_token_program_id` - Token (ERC20) 合约的引用，用户用来抵押获得 DAO 的份额。

`period_duration` - DAO 中最小的时间单位，以毫秒(ms)计。

`voting_period_length` - 投票时长。投票持续时间 = 间隔时间单位 * 投票时长（period_duration * voting_period_length）.

`grace_period_length` - 在投票期之后，DAO成员可以在一段时间内离开DAO (ragequit)，在这段时间内他们不会被稀释，最终也不会受到提案被接受到 DAO 的影响。

`dilution_bound` - 稀释界限保护成员在集体愤怒的情况下免于过度稀释。它的设计是为了缓解这样一个问题: 提案通过后，许多用户愤怒地从 DAO 退出。如果股份被稀释的限制时间比以前少，该提议将自动被拒绝。

`abort_window` - 申请人可以在退款的情况下取消提案的时间间隔(提案提交后立即开始)。

`total_shares` - 所有成员的总体份额。初始时是 0.

`members` - DAO 所有成员。

`member_by_delegate_key` - 映射提交的提案的 Key 和成员地址。

`proposal_id` - 最后一个提案的索引编号。

`proposals` - 所有的提案（提案队列）。

`approved_list` - 所有被批准的加入 DAO 的行为人。

参数 `admin`, `approved_token_program_id`, `period_duration`, `grace_period_length`, `dilution_bound`, `abort_window` 在合约初始化时进行设置。合约初始化在以下函数中进行:

```rust
#[no_mangle]
pub unsafe extern "C" fn init() {
    ...
}
```

初始化参数使用如下数据结构: 

```rust
struct InitConfig {
    admin: H256,
    approved_token_program_id: H256,
    guild_bank_id: H256,    
    period_duration: u64,
    voting_period_length: u64,
    grace_period_length: u64,
    dilution_bound: u128,
    abort_window: u64,
}
```

提案数据结构:

```rust
 pub struct Proposal {
    pub proposer: ActorId, /// - the member who submitted the proposal
    pub applicant: ActorId, /// - the applicant who wishes to become a member 
    pub shares_requested: u128, /// - the amount of shares the applicant is requesting
    pub yes_votes: u128, /// - the total number of YES votes for that proposal
    pub no_votes: u128, /// - the total number of NO votes for that proposal
    pub quorum: u128, /// - a certain threshold of YES votes in order for the proposal to pass
    pub is_membership_proposal: bool, /// - true if it is a membership proposal, false if it is a funding proposal
    pub processed: bool, /// - true if the proposal has already been processed
    pub did_pass: bool, /// - true if the proposal has passed
    pub canceled: bool, /// - true if the proposal has been canceled
    pub aborted: bool, /// - true if the proposal has been aborted
    pub token_tribute: u128, /// - the number of tokens offered for shares
    pub details: String, /// - proposal details
    pub starting_period: u64, /// - the start of the voting period
    pub max_total_shares_at_yes_vote: u128, /// - the number of total shares that were detected at yes votes
    pub votes_by_member: BTreeMap<H256, Vote>, /// - the votes on that proposal by each member
}
```
成员数据结构:

```rust
pub struct Member {
    pub delegate_key: ActorId, /// - the key responsible for submitting proposals and voting ( by default it is equal to member address)
    pub shares: u128, /// - the shares of that member
    pub highest_index_yes_vote: u128, /// - the index of the highest proposal on which the members voted YES (that value is checked when user is going to leave the DAO)
}
``` 

合约接收的外部 Action 在枚举 `Actions` 中定义。合约的返回在枚举 `Events` 中定义。

## DAO 函数

 - 添加行为人到审核列表中。这些被添加的行为人可以存入他们的 Token 到 DAO 中，同时 DAO 的成员可以提交提案来将他们加入 DAO 成员中。

```rust
fn add_to_approved_list(
		&mut self,
		member: &ActorId,
)
```

 - 加入DAO的提议。提案只能由现有成员提交。

```rust
async fn submit_membership_proposal(
        &mut self,
        applicant: &ActorId,
        token_tribute: u128,
        shares_requested: u128,
        quorum: u128,
        details: String,
    )
```

 - 资助提案。“申请人”是一个将得到资助的行为人。

```rust
async fn submit_funding_proposal(
        &mut self,
        applicant: &ActorId,
        amount: u128,
        quorum: u128,
        details: String,
    )
```

 - 成员或者成员的委托地址可以提交他们对于提案的投票（YES 或 NO）。

```rust
async fn submit_vote(
        &mut self,
        proposal_id: u128,
        vote: Vote,
    )
```

 - 申请人中止提案的权利。如果申请人不同意申请人所请求的股份或申请人所表示的细节，可以使用这个权利。

```rust
async fn abort(
        &mut self,
        proposal_id: u128
    )
```

 - 如果没有赞成票，提案人有权在投票期结束后取消提案。

```rust
async fn cancel_proposal(
        &mut self,
        proposal_id: u128,
    )
```

 - 成员在宽限期内提取资产的权利。如果成员们不同意提案的结果，同时提案被采纳的话，会对他们的股份产生影响，就可以使用这个权利。该成员只有对那项提案投了反对票才能愤然退出。

```rust
async fn ragequit(
    &mut self,
        amount: u128,
    )
```

 - 宽限期内提案竞争后的提案处理。如果提案被接受，抵押代币存入合约和新的份额被铸造并发行给申请人。如果提案被拒绝，抵押的代币将退还给申请人。

```rust
async fn process_proposal(
        &mut self,
        proposal_id: u128
    )
```

 - 这些函数将在 `async fn main()` 中通过 `Actions` 来调用。
	#[gstd::async_main]

```rust
	async fn main() {
		let action: Action = msg::load().expect("Could not load Action");
    	match action {
        Action::AddToWhiteList(input) => {
            DAO.add_to_whitelist(&ActorId::new(input.to_fixed_bytes()))
        }
        Action::SubmitMembershipProposal(input) => {
            let applicant = ActorId::new(input.applicant.to_fixed_bytes());
            DAO.submit_membership_proposal(
                &applicant,
                input.token_tribute,
                input.shares_requested,
                input.quorum,
                input.details,
            )
            .await;
        }
        Action::SubmitFundingProposal(input) => {
            let applicant = ActorId::new(input.applicant.to_fixed_bytes());
            DAO.submit_funding_proposal(&applicant, input.amount, input.quorum, input.details)
                .await;
        }
        				...
    		}
	}
```
   
 - 链下获取合约状态的能力也很重要。合约状态在 `fn meta_state()` 中定义。合约收到读取某数据请求（可接受的请求被定义在 `State` 结构中）时发送相应的返回数据。合约返回的数据定义在 `StateReply` 中。
 
```rust
pub unsafe extern "C" fn meta_state() -> *mut [i32; 2] {
    let state: State = msg::load().expect("failed to decode input argument");
    let encoded = match state {
        State::IsMember(input) => {
  	StateReply::IsMember(DAO.is_member(&ActorId::new(input.to_fixed_bytes()))).encode()
        }
       ...
    };
    let result = gstd::macros::util::to_wasm_ptr(&(encoded[..]));
    core::mem::forget(encoded);
    result
}
```