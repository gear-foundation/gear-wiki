---
sidebar_label: Rock Paper Scissors
sidebar_position: 19
---

# Rock Paper Scissors

## Introduction
Rock Paper Scissors (also known by other orderings of the three items, with "rock" sometimes being called "stone", or as Rochambeau, roshambo, or ro-sham-bo) is a hand game originating from China, usually played between two people, in which each player simultaneously forms one of three shapes with an outstretched hand. These shapes are "rock" (a closed fist), "paper" (a flat hand), and "scissors" (a fist with the index finger and middle finger extended, forming a V).

A simultaneous, zero-sum game, it has three possible outcomes: a draw, a win or a loss. A player who decides to play rock will beat another player who has chosen scissors ("rock crushes scissors" or "breaks scissors" or sometimes "blunts scissors"), but will lose to one who has played paper ("paper covers rock"); a play of paper will lose to a play of scissors ("scissors cuts paper"). If both players choose the same shape, the game is tied and is usually immediately replayed to break the tie. The game spread from China while developing different variants in signs over time.

One popular five-weapon expansion is "rock paper scissors Spock lizard", invented by Sam Kass and Karen Bryla, which adds "Spock" and "lizard" to the standard three choices. "Spock" is signified with the Star Trek Vulcan salute, while "lizard" is shown by forming the hand into a sock-puppet-like mouth. Spock smashes scissors and vaporizes rock; he is poisoned by lizard and disproved by paper. Lizard poisons Spock and eats paper; it is crushed by rock and decapitated by scissors. This variant was mentioned in a 2005 article in The Times of London and was later the subject of an episode of the American sitcom The Big Bang Theory in 2008 (as rock-paper-scissors-lizard-Spock).

Anyone can easily create their own decentralized game application and run it on the Gear Network. To do this, we have made a "rock paper scissors Spock lizard" game version for multiple players, in which the winner can be determined in several rounds of tense struggle. The source code is available on [GitHub](https://github.com/gear-dapps/rock-paper-scissors). This article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios.

## Logic

### Configuration

First of all someone(admin) should deploy a "Rock Paper Scissors Lizard spock" program with a set of game parameters.

```rust
pub struct GameConfig {
    pub bet_size: u128,
    pub players_count_limit: u8,
    pub entry_timeout: u64, // in ms
    pub move_timeout: u64, // in ms
    pub reveal_timeout: u64, // in ms
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

The registration stage continues `entry_timeout` milliseconds from the moment the program was deployed(or the end of the previous game). After that the game begins and the players can make a move.

>If time of registration stage is over, but only 1 or 0 players has registered, stage will be extended by `entry_timeout`. And the player won't be unregistered.  

### Moves

During the move phase, players must choose one of five move options(Rock Paper Scissors Lizard Spock). 

To submit a player's choice, the service that provides this capability must allow the player to enter a password or generate a password itself and save it in a local storage. Password is needed to secure user's move from other players, who would really like to see the player's move in the blockchain. After password was generated or entered service should concatenate number of move(Rock - '0', Paper - '1', Scissors - '2', Lizard - '3', Spock - '4') with password and get a string like "2pass". Then service hashes it with 256-bit blake2b, turns into a hex string and sends to the blockchain by `MakeMove(String)` with this hash inside.

>Player can't change his move.

The moves stage continues before all players is done or `move_timeout` milliseconds since registration has ended or this round has started. After that, the reveal phase begins, and the players can show the moves so that the program can determine the winner.

>If time of the moves stage is over, but no one has made a move, stage will be extended by `move_timeout`. And the players can further make their moves.
>
>If time of the moves stage is over, but only one player has made a move, this player is declared the winner and receives full reward.

### Reveal

Reveal is a necessary step in protecting the game from cheating. At this stage, the players must confirm their moves. For this they have to repeat password(or service can get it from his storage), repeat move(or service can get it from his storage) and service should just concatenate number of move(Rock - '0', Paper - '1', Scissors - '2', Lizard - '3', Spock - '4') with password and get a string like "2pass" and send it to the blockchain by `Reveal(String)` action. In this step the program validates that the hash submitted during the moves stage is equal to a hashed open string and save this move(first character from string) to determine a winners.

After all players have finished or the time has expired, the program determines the winning move to figure out the players who will continue to fight for the reward. And players who have chosen the winner move advance to the next round.

> There are situations in which program can't determine the winner move. For example, there is a Stone move, a Paper move and a Scissors move, in this situation the Stone will crush the Scissors, the Scissors will cut the Paper, and the Paper will cover the Stone, then we will not be able to determine the winning move, because all the moves are beaten. In such situations, all players move on to the next round.

After the program determines the players who have passed to the next round, moves stage starts again and advanced players can make their moves. If there is only one such player, the game ends and the entire reward goes to that player. 

When the game ends, a new game starts immediately with the new config that was set by `ChangeNextGameConfig(GameConfig)`. If it has not been installed, the old config will be relevant.

>If time of the reveal stage is over, but no one has made a move, stage will be extended by `reveal_timeout`. And the players can further reveal their moves.
>
>If time of the reveal stage is over, but only one player has revealed a move, this player is declared the winner and receives full reward. A new game starts immediately.

## Interface

### Actions

```rust
pub enum Action {
    Register,
    MakeMove(String),
    Reveal(String),
    ChangeNextGameConfig(GameConfig),
    StopGame,
}
```

- `Register` is an action for player to get registered in lobby of this game.
- `MakeMove` is an action to send blake2b hash of player's move concatenated with password.
- `Reveal` is an action to reveal player's move to the program.
- `ChangeNextGameConfig` is an action that allows an owner to change next game configuration that will start immediately after current game.
- `StopGame` is an action that allows an owner to end current game and give current players their part of reward.

### Events

```rust
pub enum Event {
    PlayerRegistred,
    SuccessfulMove(ActorId),
    SuccessfulReveal(RevealResult),
    GameConfigChanged,
    GameWasStopped(BTreeSet<ActorId>),
}

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
- `GameWasStopped` is an event that occurs when the wallet uses `StopGame` action successfully, it returns the IDs of the players who got their reward or got their bet back.

### State

*Requests:*

```rust
pub enum State {
    Config,
    LobbyList,
    GameState,
    CurrentStageTimestamp,
}

pub enum GameStage {
    Preparation,
    InProgress(StageDescription),
    Reveal(StageDescription),
}

pub struct StageDescription {
    pub anticipated_players: BTreeSet<ActorId>,
    pub finished_players: BTreeSet<ActorId>,
}
```

- `Config` returns `GameConfig` of a current game.
- `LobbyList` returns a list of all players registered in this game whether they are currently out of the game or not. 
- `GameStage` returns current `GameStage` with the corresponding `StageDescription`, if necessary, where the program user can get information about the players who are anticipated(`anticipated_players`) at this stage or already finished(`finished_players`).
- `CurrentStageTimestamp` returns timestamp of current stage start.

Each state request has a corresponding reply with the same name.

*Replies:*

```rust
pub enum StateReply {
    Config(GameConfig),
    LobbyList(Vec<ActorId>),
    GameStage(GameStage),
    CurrentStageTimestamp(u64),
}
```

## Source code

The source code of Rock Paper Scissors implementation and the example of an implementation of its testing is available on [GitHub](https://github.com/gear-dapps/rock-paper-scissors).

For more details about testing smart contracts written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
