---
sidebar_label: Tamagotchi Battle
sidebar_position: 8
---

# Tamagotchi Battle

TODO: add a description

## Implementation details

### Tamagotchi Battle contract description

The Tamagotchi Battle contract contains the following information

```rust title="tamagotchi-battle/src/lib.rs"
struct Battle {
    admins: Vec<ActorId>,
    players: BTreeMap<ActorId, Player>,
    players_ids: Vec<ActorId>,
    current_players: Vec<ActorId>,
    state: BattleState,
    current_winner: ActorId,
    pairs: BTreeMap<PairId, Pair>,
    players_to_pairs: BTreeMap<ActorId, Vec<PairId>>,
    completed_games: u8,
    reservations: BTreeMap<ActorId, ReservationId>,
}
```
TODO: 
* `admins` - 
* `players` - 
* `players_ids` -  
* `current_players` - 
* `state` - 
* `current_winner` - 
* `pairs` - 
* `players_to_pairs` - 
* `completed_games` - 
* `reservations` - 

### Action

The Tamagotchi Battle contract offers the following activities:

```rust title="tamagotchi-battle/io/src/lib.rs"
pub enum BattleAction {
    StartRegistration,
    Register {
        tmg_id: TamagotchiId,
    },
    MakeMove {
        pair_id: PairId,
        tmg_move: Move,
    },
    StartBattle,
    AddAdmin(ActorId),
    CheckIfMoveMade {
        pair_id: PairId,
        tmg_id: Option<TamagotchiId>,
    },
}
```

### Event

For each activity, the program responds with the following replies:

```rust title="tamagotchi-battle/io/src/lib.rs"
pub enum BattleEvent {
    RegistrationStarted,
    Registered { tmg_id: TamagotchiId },
    MoveMade,
    GoToWaitingState,
    GameIsOver,
    InfoUpdated,
    NewGame,
    BattleStarted,
    RoundResult((PairId, u16, u16, Option<Move>, Option<Move>)),
    NewRound,
    AdminAdded,
}
```

### Logic

TODO

## Program metadata and state
Metadata interface description:

```rust title="tamagotchi-battle/io/src/lib.rs"
pub struct BattleMetadata;

impl Metadata for BattleMetadata {
    type Init = ();
    type Handle = InOut<BattleAction, BattleEvent>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = Out<Battle>;
}
```

To display the contract state information, the `state()` function is used:

```rust title="tamagotchi-battle/io/src/lib.rs"
#[no_mangle]
extern fn state() {
    let battle = unsafe { BATTLE.take().expect("Unexpected error in taking state") };
    msg::reply(battle, 0).expect("Failed to share state");
}
```

## Source code

The source code of this example of Tamagotchi Battle smart contract and the example of an implementation of its testing is available on [gear-foundation/dapp/contracts/tamagotchi-battle](https://github.com/gear-foundation/dapps/tree/master/contracts/tamagotchi-battle).

See also an example of the smart contract testing implementation based on `gtest`: [gear-foundation/dapps/tamagotchi-battle/tests](https://github.com/gear-foundation/dapps/tree/master/contracts/tamagotchi-battle/tests).

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
