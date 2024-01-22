---
sidebar_label: Rock Paper Scissors
sidebar_position: 4
---

# Rock Paper Scissors

## Introduction
Rock Paper Scissors (also known by other orderings of the three items, with "rock" sometimes being called "stone", or as Rochambeau, roshambo, or ro-sham-bo) is a hand game originating from China, usually played between two people, in which each player simultaneously forms one of three shapes with an outstretched hand. These shapes are "rock" (a closed fist), "paper" (a flat hand), and "scissors" (a fist with the index finger and middle finger extended, forming a V).

A simultaneous, zero-sum game, it has three possible outcomes: a draw, a win or a loss. A player who decides to play rock will beat another player who has chosen scissors ("rock crushes scissors" or "breaks scissors" or sometimes "blunts scissors"), but will lose to one who has played paper ("paper covers rock"); a play of paper will lose to a play of scissors ("scissors cuts paper"). If both players choose the same shape, the game is tied and is usually immediately replayed to break the tie. The game spread from China while developing different variants in signs over time.

One popular five-weapon expansion is "rock paper scissors Spock lizard", invented by Sam Kass and Karen Bryla, which adds "Spock" and "lizard" to the standard three choices. "Spock" is signified with the Star Trek Vulcan salute, while "lizard" is shown by forming the hand into a sock-puppet-like mouth. Spock smashes scissors and vaporizes rock; he is poisoned by lizard and disproved by paper. Lizard poisons Spock and eats paper; it is crushed by rock and decapitated by scissors. This variant was mentioned in a 2005 article in The Times of London and was later the subject of an episode of the American sitcom The Big Bang Theory in 2008 (as rock-paper-scissors-lizard-Spock).

Anyone can easily create their own decentralized game application and run it on the Gear Network. To do this, Gear made a "rock paper scissors Spock lizard" game version for multiple players, in which the winner can be determined in several rounds of tense struggle. The source code is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/rock-paper-scissors). This article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios.

## Logic

### Configuration

First of all someone(admin) should deploy a "Rock Paper Scissors Lizard spock" program with a set of game parameters.

```rust title="rock-paper-scissors/io/src/lib.rs"
pub struct GameConfig {
    pub bet_size: u128,
    pub players_count_limit: u8,
    pub entry_timeout_ms: u64,
    pub move_timeout_ms: u64,
    pub reveal_timeout_ms: u64,
}
```

### Change Next Game Config

Admin at all game stages can change next game configuration by using `ChangeNextGameConfig(GameConfig)` action.

When the current game ends, this config will be applied.

### Stop The Game

Admin at all game stages can stop the game by using `StopGame` action.

This action can be used, for example, to change the configuration of the game, or if the players have gone on strike and do not want to continue playing, or if the game has gone on for a long time.

When the administrator stops the game, all funds are distributed among the players remaining in the game. If the game is in the registration stage, bets will be returned to the entire lobby.

### Registration

Then players can register for the game by paying a bet(of bet_size) with sending `Register` action.

The registration stage continues `entry_timeout_ms` milliseconds from the moment the program was deployed(or the end of the previous game). After that the game begins and the players can make a move.

>If time of registration stage is over, but only 1 or 0 players has registered, stage will be extended by `entry_timeout_ms`. And the player won't be unregistered.

### Moves

During the move phase, players must choose one of five move options(Rock Paper Scissors Lizard Spock).

To submit a player's choice, the service allowing this must enable the player to create or input a password, saving it locally. This password is crucial for safeguarding the user's move from other players keen on observing it in the blockchain. Once the password is either generated or entered, the service combines it with the numerical representation of the move (Rock - '0', Paper - '1', Scissors - '2', Lizard - '3', Spock - '4') to form a string, such as "2pass." Subsequently, the service hashes this string using a 256-bit blake2b, transforms it into binary, and transmits it to the blockchain via the `MakeMove(Vec<u8>)` function with the hash embedded.

>The player is unable to alter their move. 

The moves stage persists until all players have completed their moves or the specified `move_timeout_ms` milliseconds have elapsed since registration ended or the round began. Following this, the reveal phase initiates, allowing players to display their moves for the program to ascertain the winner.

>If the moves stage time elapses with no moves made, the stage extends by `move_timeout_ms`, enabling players to proceed with their moves.
>
>In a scenario where the moves stage time elapses, but only one player has made a move, that player is declared the winner and receives the full reward.

### Reveal

Reveal is a necessary step in protecting the game from cheating. During this phase, players are required to confirm their moves. To achieve this, they need to reiterate the password (or allow the service to retrieve it from their storage) and restate the move (or let the service obtain it from their storage). The service then concatenates the number corresponding to the move (Rock - '0', Paper - '1', Scissors - '2', Lizard - '3', Spock - '4') with the password, creating a string-like `2pass`. Subsequently, the program transforms this string into a UTF-8-encoded byte array and transmits it to the blockchain through the `Reveal(Vec<u8>)` action. In this stage, the program verifies that the hash submitted during the move phase matches a hashed open string and records this move (the first character from the string) to determine the winners.

Once all players have completed their moves or the allotted time has elapsed, the program identifies the winning move to determine the players advancing to the next round. Participants selecting the winning move progress to the subsequent round.

> Certain scenarios exist where the program cannot determine the winning move, such as in the case of a Stone move, a Paper move, and a Scissors move. In such situations, where each move counters the others, all players move on to the next round.

After determining the players advancing to the next round, the move stage restarts, and advanced players make their moves. If only one player remains, the game concludes, and the entire reward is awarded to that player.

Upon the conclusion of the game, a new game promptly commences with the new configuration established by `ChangeNextGameConfig(GameConfig)`. If no new configuration is set, the previous one remains in effect.

> In instances where the reveal stage's time expires, but no moves have been made, the stage is extended by `reveal_timeout_ms`, allowing players to reveal their moves.
> 
> If the reveal stage's time elapses, but only one player reveals a move, that player is declared the winner, receiving the full reward, and a new game begins immediately.

## Interface

### Actions

```rust title="rock-paper-scissors/io/src/lib.rs"
pub enum Action {
    /// Registers a player for the game.
    /// Player must send value to be registered
    ///
    /// # Requirements:
    /// * Game is not in progress yet. E.g. the `GameStage` must be `GameStage::Preparation`
    /// * `msg::value()` is greater or equal to `bet_size` in the config(refund will return to user).
    /// * Player not registred yet.
    /// * Lobby is not full.
    ///
    /// On success replies `Event::PlayerRegistred`.
    Register,

    /// Submits player's move to the program in encrypted form.
    /// Player can't change his move after it.
    ///
    /// # Arguments:
    /// * `Vec<u8>`: is the binary 256-bit blake2b hash of move("0" or "1" or "2" or "3" or "4") + "password".
    ///
    /// # Requirements:
    /// * The `GameStage` must be `GameStage::InProgress(StageDesciption)` where `StageDescription::anticipated_players` must contains `msg::source()`
    ///
    /// On success replies `Event::SuccessfulReveal(RevealResult)` where `RevealResult` will correspond to the situation after this reveal.
    MakeMove(Vec<u8>),

    /// Reveals the move of the player, with which players must confirm their moves.
    /// In this step the program validates that the hash submitted during the moves stage is equal
    /// to a hashed open string and save this move(first character from string) to determine the winners.
    ///
    /// # Arguments:
    /// * `Vec<u8>`: is the binary move("0" or "1" or "2" or "3" or "4") + "password" that should be equal to binary that was sent in `MakeMove(Vec<u8>)` without hashing.
    ///
    /// # Requirements:
    /// * The hashed(by program) `Reveal` binary must be equal to this round `MakeMove` binary.
    /// * The `GameStage` must be `GameStage::Reveal(StageDesciption)` where `StageDescription::anticipated_players` must contains `msg::source()`
    ///
    /// On success replies `Event::SuccessfulMove(ActorId)` where `ActorId` is the moved player's address.
    Reveal(Vec<u8>),

    /// Changes the game config of the next game.
    /// When the current game ends, this config will be applied.
    ///
    /// # Arguments:
    /// * `GameConfig`: is the config that will be applied to the next game.
    ///
    /// # Requirements:
    /// * The `msg::source()` must be the owner of the program.
    /// * `players_count_limit` of the `GameConfig` must be greater than 1
    /// * `entry_timeout` of the `GameConfig` must be greater than 5000(5 sec)
    /// * `move_timeout` of the `GameConfig` must be greater than 5000(5 sec)
    /// * `reveal_timeout` of the `GameConfig` must be greater than 5000(5 sec)
    ///
    /// On success replies `Event::GameConfigChanged`.
    ChangeNextGameConfig(GameConfig),

    /// Stops the game.
    /// This action can be used, for example, to change the configuration of the game,
    /// or if the players have gone on strike and do not want to continue playing,
    /// or if the game has gone on for a long time.
    /// When the admin stops the game, all funds are distributed among the players remaining in the game.
    /// If the game is in the registration stage, bets will be returned to the entire lobby.
    ///
    /// # Requirements:
    /// * The `msg::source()` must be the owner of the program.
    ///
    /// On success replies `Event::GameWasStopped(BTreeSet<ActorId>)` where inside are the players who got the money.
    StopGame,
}
```

- `Register` is an action for player to get registered in lobby of this game.
- `MakeMove` is an action to send blake2b hash of player's move concatenated with password.
- `Reveal` is an action to reveal player's move to the program.
- `ChangeNextGameConfig` is an action that allows an owner to change next game configuration that will start immediately after current game.
- `StopGame` is an action that allows an owner to end current game and give current players their part of reward.

### Events

```rust title="rock-paper-scissors/io/src/lib.rs"
pub enum Event {
    PlayerRegistered,
    SuccessfulMove(ActorId),
    SuccessfulReveal(RevealResult),
    GameConfigChanged,
    GameStopped(BTreeSet<ActorId>),
}
```
```rust title="rock-paper-scissors/io/src/lib.rs"
pub enum RevealResult {
    Continue,
    NextRoundStarted { players: BTreeSet<ActorId> },
    GameOver { winner: ActorId },
}
```

- `PlayerRegistred` is an event that occurs when someone uses `Register` action successfully.
- `SuccessfulMove(ActorId)` is an event that occurs when someone uses `MakeMove` action successfully, it returns an ActorId of the player who made this move.
- `SuccessfulReveal` is an event that occurs when someone uses `Reveal` action successfully, it returns reveal result with actual game stage after this reveal.
- `GameConfigChanged` is an event that occurs when someone uses `ChangeNextGameConfig` action successfully.
- `GameStopped` is an event that occurs when the wallet uses `StopGame` action successfully, it returns the IDs of the players who got their reward or got their bet back.

### Programm metadata and state
Metadata interface description:

```rust title="rock-paper-scissors/io/src/lib.rs"
pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = In<GameConfig>;
    type Handle = InOut<Action, Event>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Out<ContractState>;
}
```
To display the full program state information, the `state()` function is used:

```rust title="rock-paper-scissors/src/lib.rs"
#[no_mangle]
extern fn state() {
    let game = unsafe { RPS_GAME.take().expect("Unexpected error in taking state") };
    msg::reply::<ContractState>(game.into(), 0)
        .expect("Failed to encode or reply with `ContractState` from `state()`");
}
```
To display only necessary certain values from the state, you need to write a separate crate. In this crate, specify functions that will return the desired values from the `ContractState` state. For example - [rock-paper-scissors/state](https://github.com/gear-foundation/dapps/tree/master/contracts/rock-paper-scissors/state):

```rust title="rock-paper-scissors/state/src/lib.rs"
#[gmeta::metawasm]
pub mod metafns {
    pub type State = ContractState;

    pub fn config(state: State) -> GameConfig {
        state.game_config
    }

    pub fn lobby_list(state: State) -> Vec<ActorId> {
        state.lobby
    }

    pub fn game_stage(state: State) -> GameStage {
        state.stage
    }

    pub fn current_stage_start_timestamp(state: State) -> u64 {
        state.current_stage_start_timestamp
    }
}
```

## Source code

The source code of Rock Paper Scissors implementation and the example of an implementation of its testing is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/rock-paper-scissors).

For more details about testing programs written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
