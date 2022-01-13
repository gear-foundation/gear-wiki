---
sidebar_label: 'DAO'
sidebar_position: 3
---

# Decentralized autonomous organization

The smart-contract is avaialbe on GitHub: https://github.com/gear-tech/apps/tree/master/dao

### Structs

```rust
/// Initial parameters:
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

`admin` - the only member that is initially in DAO. He has 1 share that allows him to submit new proposal and therefore add new members.

`approved_token_program_id` - the reference to the token contract (ERC20) that users use as pledge to get the share in the DAO.

`period_duration` - the smallest unit time interval for the DAO.

`voting_period_length` - voting time interval.

`grace_period_length` - after the voting period the DAO members are given a period of time in which they can leave the DAO(ragequit) without being diluted and ultimately affected by the proposal’s acceptance into the DAO.

`dilution_bound` - The dilution bound protects members from excessive dilution in case of a mass ragequit. It is designed to mitigate an issue where a proposal is passed, then many users rage quit from the DAO. The proposal will be automatically rejected if the total amount of shares becomes dilutionBound times less than it was before.

`abort_window` - the time interval during which the applicant can cancel the proposal with funds refunded (that starts immediately when the proposal is submitted).

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
The params `admin`, `approved_token_program_id`, `period_duration`, `grace_period_length`, `dilution_bound`, `abort_window` are set when initializing a contract.

`total_shares` - total shares across all members. Initially it is zero.

`members` - members of the DAO.

`member_by_delegate_key` - mapping the key responsible for submitting proposals and the member address.

`proposal_id` - the index of the last proposal.

`proposals` - all proposals (the proposal queue).

`approved_list` - list of actors that are approved for joining the DAO.

```rust
 pub struct Proposal {
    pub proposer: ActorId, /// - the member who submitted the proposal
    pub applicant: ActorId, /// - the applicant who wishes to become a member 
    pub shares_requested: u128, /// - the amount of shares the applicant is requesting
    pub yes_votes: u128, /// - the total number of YES votes for that proposal
    pub no_votes: u128, /// - the total number of NO votes for that proposal
    pub quorum: u128, /// - a certain threshold of YES votes in order for the proposal to pass
  pub is_membership_proposal: bool, /// - true if it is a membership proposal, false if it is a funding 	 proposal
    pub processed: bool, /// - true if the proposal has already been processed
    pub did_pass: bool, /// - true if the proposal has passed
    pub cancelledcanceled: bool, /// - true if the proposal has been cancelledcanceled
    pub aborted: bool, /// - true if the proposal has been aborted
    pub token_tribute: u128, /// - the number of tokens offered for shares
    pub details: String, /// - proposal details
    pub starting_period: u64, /// - the start of the voting period
    pub max_total_shares_at_yes_vote: u128, /// - the number of total shares that were detected at yes votes
    pub votes_by_member: BTreeMap<H256, Vote>, /// - the votes on that proposal by each member
}
```

```rust
pub struct Member {
    pub delegate_key: ActorId, /// - the key responsible for submitting proposals and voting ( by default it is equal to member address)
    pub shares: u128, /// - the shares of that member
    pub highest_index_yes_vote: u128, /// - the index of the highest proposal on which the members voted YES (that value is checked when user is going to leave the DAO)
}
``` 

### Functions

#### Initializes the DAO with initial parameters.

```rust
fn init_dao(
        &mut self,
        admin: &ActorId,
        approved_token_program_id: &ActorId,
        guild_bank_id: &ActorId,
        voting_period_length: u64,
        period_duration: u64,
        grace_period_length: u64,
        abort_window: u64,
        dilution_bound: u128,
    )
```

#### Adds actors to approved list. The added actors can deposit their tokens to DAO and a DAO member can submit a proposal of joining them DAO.

```rust
fn add_to_approved_list(
		 &mut self,
		member: &ActorId,
)
```

#### The proposal of joining the DAO. The proposal can be submitted only by the existing members. 

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

#### The funding proposal. The 'applicant' is an actor that will be funded.

```rust
async fn submit_funding_proposal(
        &mut self,
        applicant: &ActorId,
        amount: u128,
        quorum: u128,
        details: String,
    )
```

#### The member (or the delegate address of the member) submit his vote (YES or NO) on the proposal.

```rust
async fn submit_vote(
        &mut self,
        proposal_id: u128,
        vote: Vote,
    )
```

#### The right of the applicant to abort the proposal. It can be used in case when applicant is disagree with the requested shares or the details the proposer  indicated by the proposer.

```rust
async fn abort(
        &mut self,
        proposal_id: u128
    )
```

#### The right of the proposer to cancel the proposal after the end of the voting period if there are no YES votes.

```rust
async fn cancel_proposal(
        &mut self,
        proposal_id: u128,
    ) 
```

 #### The right for members to withdraw their capital during the grace period. It can be used when the members don’t agree with the result of the proposal and the acceptance of that proposal can affect their shares. The member can ragequit only if he has voted NO on that proposal.

 ```rust
 async fn ragequit(
        &mut self,
        amount: u128,
    ) 
```

#### The proposal processing after the proposal competes during the grace period. If the proposal is accepted, the tribute tokens are deposited into the contract and new shares are minted and issued to the applicant. If the proposal is rejected, the tribute tokens are returned to the applicant. 

```rust
async fn process_proposal(
        &mut self,
        proposal_id: u128
    ) 
```