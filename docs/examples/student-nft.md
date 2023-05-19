---
sidebar_label: Student NFT
sidebar_position: 26
---

# Student NFT

## Overview

This is an example of a special custom NFT that combines the mechanics of nested resources and non-transferable(`soulbound`) to track courses and progress of gear academy students on-chain.

The contract allows you to create courses, take courses, add lessons, leave comments and emoji reactions, etc. All of this improves the academy's social environment, as well as allowing you to track your progress and the progress of other students on-chain.

Moreover, the contract provides mechanics for checking homework. The course creator can collect off-chain information about tasks completed, check and upload a grade with a link to the solution and other meta-data directly to the student's nft. When the course is completed and the student completes all homework assignments, the course counts as `completed` for the student.

Gear provides an example implementation of the student nft. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own student nft implementation and run it on the Gear Network. The source code is available on [GitHub](https://github.com/gear-dapps/student-nft).

## Storage Structure

```rust
#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub struct EmoteState {
    pub upvotes: Vec<ActorId>,
    pub reactions: Vec<(ActorId, String)>,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub struct StudentNftState {
    pub nfts: Vec<(NftId, Nft)>,
    pub nft_owners: Vec<(ActorId, NftId)>,
    pub courses: Vec<(CourseId, Course)>,
    pub emotes: Vec<(EmoteId, EmoteState)>,
    pub nft_nonce: NftId,
    pub course_nonce: CourseId,
    pub emote_nonce: EmoteId,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub struct Nft {
    pub owner: ActorId,
    pub actual_courses: Vec<ActualCourse>,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub struct ActualCourse {
    pub id: CourseId,
    pub hws: Vec<Hw>,
    pub is_completed: bool,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub struct Hw {
    pub lesson_id: LessonId,
    pub solution_url: String,
    pub comment: Option<String>,
    pub rate: u8,
    pub check_date: i64,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub struct Course {
    pub owner: ActorId,
    pub name: String,
    pub description: String,
    pub lessons: Vec<Lesson>,
    pub emote_id: EmoteId,
    pub is_finished: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub struct Lesson {
    pub name: String,
    pub description: String,
    pub media_url: String,
    pub thumb_url: String,
    pub reviews: Vec<(ActorId, String)>,
    pub emote_id: EmoteId,
    pub is_provide_hw: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode, TypeInfo)]
pub enum EmoteAction {
    Upvote,
    Reaction { emoji: Option<String> },
}
```

### `Action` and `Event`

`Event` is generated when `Action` is triggered. `Action` enum wraps various `Input` structs, `Event` wraps `Reply`.

```rust
#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub enum StudentNftAction {
    Mint,
    CreateCourse {
        name: String,
        description: String,
    },
    StartCourse {
        course_id: CourseId,
    },
    AddLesson {
        course_id: CourseId,
        lesson: Lesson,
    },
    ApproveHw {
        nft_id: NftId,
        course_id: CourseId,
        lesson_id: LessonId,
        solution_url: String,
        comment: Option<String>,
        rate: u8,
    },
    Emote {
        id: EmoteId,
        action: EmoteAction,
    },
    AddLessonReview {
        course_id: CourseId,
        lesson_id: LessonId,
        review: String,
    },
    FinishCourse {
        course_id: CourseId,
    },
    CompleteCourse {
        course_id: CourseId,
    },
}
```

```rust
#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
pub enum StudentNftEvent {
    Minted {
        user: ActorId,
        id: NftId,
    },
    CourseCreated {
        owner: ActorId,
        id: CourseId,
    },
    CourseStarted {
        user: ActorId,
        id: CourseId,
    },
    LessonAdded {
        course_id: CourseId,
    },
    HwApproved {
        course_id: CourseId,
        nft_id: NftId,
        hw: Hw,
    },
    Emote {
        user: ActorId,
        action: EmoteAction,
    },
    LessonReviewAdded {
        user: ActorId,
        course_id: CourseId,
        lesson_id: LessonId,
        review: String,
    },
    CourseFinished {
        course_id: CourseId,
    },
    CourseCompleted {
        user: ActorId,
        course_id: CourseId,
    },
    Error(String),
}
```

## Conclusion

A source code of the contract example provided by Gear is available on GitHub: [student-nft/src/contract.rs](https://github.com/gear-dapps/student-nft/blob/master/src/contract.rs).

See also an example of the smart contract testing implementation based on `gtest` and `gclient`: [student-nft/tests](https://github.com/gear-dapps/student-nft/tree/master/tests).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
