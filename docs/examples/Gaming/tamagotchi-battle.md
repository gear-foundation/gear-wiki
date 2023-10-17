---
sidebar_label: Tamagotchi Battle
sidebar_position: 8
---

# Tamagotchi Battle

This game will help you learn how to upload smart contracts (programs) to the blockchain, change their state, use them in connection with other smart contracts and finally just have a good time!

To start, each player must have their own *Tamagotchi smart contract*. Please upload it to the [Vara Network Testnet](https://idea.gear-tech.io/programs?node=wss%3A%2F%2Ftestnet.vara.rs).

Then the administrator opens the registration for the battle. Under the hood, the `StartRegistration` action is responsible for this.

You can then register your Tamagotchi as a participant in the battle. Please do so. Under the hood, the `Register` action is responsible for this. To register you need to put in the contract state the id of your Tamagotchi.

When all participants are registered the administrator can start the battle (`StartBattle` action). The participants are automatically split into pairs ( `split_into_pairs` function). The state of the pair is placed in struct `Pair`.

During the battle, each player must make a move (`MakeMove` action). A player can attack or defend. Based on the results of two players' moves, the `resolve_battle` function compares their health and determines the winner. The winner has the opportunity to participate in the next round.

After all participants have made moves and the winners have been determined, the administrator can continue the game and start a new round through the `StartBattle` action. The winners are again split into pairs.

The game will continue until there is only one winner left.

## How to run

1. Build a contract
> Additional details regarding this matter can be located within the [README](https://github.com/gear-foundation/dapps/tree/master/contracts/tamagotchi-battle) directory of the contract.

2. Upload the contract to the [Vara Network Testnet](https://idea.gear-tech.io/programs?node=wss%3A%2F%2Ftestnet.vara.rs)
> Further details regarding the process of contract uploading can be located within the [Getting Started](../../getting-started-in-5-minutes/#deploy-your-smart-contract-to-the-testnet) section.

3. Build and run user interface 
> More information about this can be found in the [README](https://github.com/gear-foundation/dapps/tree/master/frontend/tamagotchi-battle/frontend) directory of the frontend.

## Implementation details

### Tamagotchi Battle contract description

The Tamagotchi Battle contract contains the following information

```rust title="tamagotchi-battle/src/lib.rs"
struct Battle {
    // administrators, who start registration, start the game and each new round
    admins: Vec<ActorId>,
    // list of player parameters (struct Player)
    players: BTreeMap<ActorId, Player>,
    // contains tamagotchi id
    players_ids: Vec<ActorId>,
    current_players: Vec<ActorId>,
    // current battle stage
    state: BattleState,
    // result of the last battle
    current_winner: ActorId,
    // list of pair parameters (struct Pair)
    pairs: BTreeMap<PairId, Pair>,
    // matching players and their pair_ids
    players_to_pairs: BTreeMap<ActorId, Vec<PairId>>,
    // number of pairs that have fought
    completed_games: u8,
    // reservations for delayed messages
    reservations: BTreeMap<ActorId, ReservationId>,
}
```

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

The main information is located in the `Battle` structure. The list of possible player actions is contained in `enum Move`. Player achievements are contained in `struct Player`. Players are divided into pairs. Information about each pair is contained in `struct Pair`. 

Actions of players and admins are passed to the smart contact via `enum BattleAction`. The list of game events is contained in the `enum BattleEvent`.

The administrator starts the game by calling the function `start_registration`. Players register their Tamagotchi by the `register` function. The administrator starts each new round via calling the `start_battle` function, which also divides the players into pairs in the  `split_into_pairs` function.
Players make moves by calling the `make_move` function, which in turn calls `make_move_internal`. It determines the result of the battle in each pair, with the health of each Tamagotchi being directly calculated in the `resolve_battle` function.

Each player must make a move within the time specified in `TIME_FOR_MOVE`. If a player does not make a move, a delayed message via the `CheckIfMoveMade` action does the move for them. 

Administrators can add other administrators via the `AddAdmin` action.

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
