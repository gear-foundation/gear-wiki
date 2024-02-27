---
sidebar_position: 3
---

# Tequila Train

Tequila Train is a game similar to the Mexican Train game but has several differences in rules. Tequila Train involves a hub, trains, and tequila shots, with each player receiving between 4 to 8 tiles at the start. The game has a playable limit of 8 players using 91 tiles.

![Tequila Train Game](../img/tequila-train.png)

Typically, the program's state undergoes alterations during its utilization. An integral feature of the software implementation of this game is the ability to maintain individual timers for each player and to closely monitor time intervals, thus increasing the dynamism and intrigue of the game. Such functionality is achieved through the utilization of [Delayed messages](/docs/developing-contracts/delayed-messages), which constitute one among several distinctive attributes of the Gear protocol.

## Rules

Each player receives their dominoes, and the number of tiles they receive is automatically calculated based on the number of players.

- 2...4 players: 8 tiles per each player
- 5 players: 7 tiles per each player
- 6 players: 6 tiles per each player
- 7 players: 5 tiles per each player
- 8 players: 4 tiles per each player

Also, each player gets their own train differentiated by the color. Each player revise their tiles and see if they have matching dot numbers on both sides of one tile. 12 dots is the maximum number of each side. The player with the highest double places it in the center of the Tequila Train Hub. In case of nobody has a tile with matching numbers, each player will receive one additional tile, each player will continue receiving one additional tile till someone will receive the tile with the matching numbers on both sides.

The domino must be placed so that one end is touching the end of a domino already on the table and such that the end of the new domino matches (shows the same number of dots) the end of the domino it is adjacent to. Unless the tile is a double, the tile can be placed square in any one of the three directions as long as the two matching sides are touching fully.

First player only places the first tile (maximum double) and then the turn goes to the next player. If, in a later turn, the player draws a domino that enables them to start their train, they can only play this one domino. The player can remove their train but they are free to leave it as is (see below).

If a player is unable to play and the boneyard is empty, the player must simply pass and ensure that a marker is placed upon their train.

In case if a player doesn’t have a matching tile they put a train in their line and skip their turn. Since they have a train another player can put their tile in the line. For the next turn the player with the train can take additional tile from the tiles pool.

Anyone who wants to get their train back after playing a domino to their track should drink one shot of tequila or they will leave their train on the board.

The aim is to be the first player to get rid of all the dominoes in their hand. As soon as this happens, even if the last tile is a Double, the game ends.

Everyone can play the game via this link - [Play Tequila Train](https://tequila-train.vara.network/).

## How to run

Source code can be found in the [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/tequila-train).

1. Build a program
> Additional details regarding this matter can be located within the [README](https://github.com/gear-foundation/dapps/tree/master/contracts/tequila-train/README.md) directory of the program.

2. Upload the program to the [Vara Network Testnet](https://idea.gear-tech.io/programs?node=wss%3A%2F%2Ftestnet.vara.network)
> Further details regarding the process of program uploading can be located within the [Getting Started](../../getting-started-in-5-minutes#deploy-your-program-to-the-testnet) section.

3. Build and run user interface
> More information about this can be found in the [README](https://github.com/gear-foundation/dapps/blob/master/frontend/apps/tequila-train/README.md) directory of the frontend.

## Implementation details

```rust title="tequila-train/src/lib.rs"
pub struct GameLauncher {
    pub games: HashMap<ActorId, Game>,
    pub players_to_game_id: HashMap<ActorId, ActorId>,
    pub config: Config,
}
```
* `games` - list of all games according to the address of the game's creator
* `player_to_game_id` - list of players and the games in which they participate
* `config` - application configuration

The configuration contains information about how much time participants are given to move, and how much gas is needed for delayed messages:

```rust title="tequila-train/io/src/lib.rs"
pub struct Config {
    pub time_to_move: u32,
    pub gas_to_check_game: u64,
}
```

`Game` information looks as follows:

```rust title="tequila-train/io/src/lib.rs"
pub struct Game {
    pub admin: ActorId,
    pub game_state: Option<GameState>,
    pub initial_players: Vec<ActorId>,
    pub state: State,
    pub is_started: bool,
    pub bid: u128,
}
```

* `admin` - game administrator's address
* `game_state` - all information is stored if the game has started
* `initial_players` - addresses of all players in the game
* `state` - game status
* `is_started` - start flag
* `bid` - gaming bet 

```rust title="tequila-train/io/src/lib.rs"
pub struct GameState {
    pub players: Vec<Player>,
    pub tracks: Vec<TrackData>,
    pub shots: Vec<u32>,
    pub start_tile: u32,
    pub current_player: u32,
    pub tile_to_player: BTreeMap<u32, u32>,
    pub tiles: Vec<Tile>,
    pub remaining_tiles: BTreeSet<u32>,
    pub time_to_move: u32,
    pub last_activity_time: u64,
}
```

* `players` - all player information
* `tracks` - track information
* `shots` - number of shots of each player
* `start_tile` - starter tile
* `current_player` - player who is currently on a turn
* `tile_to_player` - a list of tiles and their owners
* `tiles` - list of all tiles
* `remaining_tiles` - list of tiles that have not yet participated in the game
* `time_to_move` - time to move
* `last_activity_time` - time of last activity

```rust title="tequila-train/io/src/lib.rs"
/// Information about the player's track
pub struct TrackData {
    pub tiles: Vec<Tile>,
    pub has_train: bool,
}
```
```rust title="tequila-train/io/src/lib.rs"
/// Domino tile
pub struct Tile {
    pub left: Face,
    pub right: Face,
}
```
```rust title="tequila-train/io/src/lib.rs"
/// Tile's face (number of dots)
pub enum Face {
    Zero,
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Eleven,
    Twelve,
}
```
```rust title="tequila-train/io/src/lib.rs"
/// The state of the game
pub enum State {
    Playing,
    Winners(Vec<ActorId>),
    #[default]
    Registration,
}
```

### Initialization

```rust title="tequila-train/src/lib.rs"
#[no_mangle]
extern fn init() {
    let config: Config = msg::load().expect("Unable to decode the initial msg");
    let game_launcher = GameLauncher {
        config,
        ..Default::default()
    };

    unsafe { GAME_LAUNCHER = Some(game_launcher) };
}
```

### Command

```rust title="tequila-train/io/src/lib.rs"
pub enum Command {
    CreateGame,
    Skip {
        creator: ActorId,
    },
    Place {
        creator: ActorId,
        tile_id: u32,
        track_id: u32,
        remove_train: bool,
    },
    Register {
        creator: ActorId,
    },
    CancelRegistration {
        creator: ActorId,
    },
    DeletePlayer {
        player_id: ActorId,
    },
    CheckGame {
        game_id: ActorId,
        last_activity_time: u64,
    },
    StartGame,
    CancelGame,
    LeaveGame,
}
```
### Event

```rust title="tequila-train/io/src/lib.rs"
pub enum Event {
    GameFinished {
        winners: Vec<ActorId>,
    },
    GameCreated,
    Skipped,
    Placed {
        tile_id: u32,
        track_id: u32,
        remove_train: bool,
    },
    Registered {
        player: ActorId,
    },
    RegistrationCanceled,
    PlayerDeleted {
        player_id: ActorId,
    },
    GameStarted,
    GameCanceled,
    GameLeft,
    Checked,
}
```

Game session creation:

```rust title="tequila-train/src/lib.rs"
// creating a game session, after this action other users can register to the game using the creator's address.
pub fn create_game(&mut self, msg_source: ActorId, msg_value: u128) -> Result<Event, Error> {
    if self.players_to_game_id.contains_key(&msg_source) {
        return Err(Error::SeveralGames);
    }

    let mut game = Game {
        admin: msg_source,
        bid: msg_value,
        ..Default::default()
    };
    game.initial_players.push(msg_source);
    self.games.insert(msg_source, game);
    self.players_to_game_id.insert(msg_source, msg_source);
    Ok(Event::GameCreated)
}
```

After creating a game session other players can register for the game: 

```rust title="tequila-train/src/lib.rs"

pub fn register(
    &mut self,
    msg_source: ActorId,
    msg_value: u128,
    creator: ActorId,
) -> Result<Event, Error> {
    if self.players_to_game_id.contains_key(&msg_source) {
        return Err(Error::SeveralGames);
    }
    let game = self
        .games
        .get_mut(&creator)
        .ok_or(Error::GameDoesNotExist)?;

    if game.is_started {
        return Err(Error::GameHasAlreadyStarted);
    }

    if msg_value != game.bid {
        return Err(Error::WrongBid);
    }

    if game.initial_players.contains(&msg_source) {
        return Err(Error::YouAlreadyRegistered);
    }

    if game.initial_players.len() >= 8 {
        return Err(Error::LimitHasBeenReached);
    }

    game.initial_players.push(msg_source);
    self.players_to_game_id.insert(msg_source, creator);
    Ok(Event::Registered { player: msg_source })
}

```

Program makes all preparations during the start of the game.

1. Each player gets their dominoes; the tile count is calculated automatically depending on the player count.
2. The program tries to find the maximum double through users. If it doesn’t, it adds one tile to each user and repeats this step until double has been found.
3. Program chooses the double and selects the first user.

```rust title="tequila-train/src/lib.rs"
pub fn start(&mut self) -> Result<Event, Error> {
    let msg_src = msg::source();
    let game = self
        .games
        .get_mut(&msg_src)
        .ok_or(Error::GameDoesNotExist)?;

    if game.is_started {
        return Err(Error::GameHasAlreadyStarted);
    }
    if game.initial_players.len() < 2 {
        return Err(Error::NotEnoughPlayers);
    }

    game.is_started = true;
    game.game_state = GameState::new(
        game.initial_players.clone(),
        self.config.time_to_move,
        exec::block_timestamp(),
    );
    game.state = State::Playing;

    // send a delayed message to check if the current player has made a move within the `config.time_to_move` limit
    msg::send_with_gas_delayed(
        exec::program_id(),
        Command::CheckGame {
            game_id: msg_src,
            last_activity_time: game.game_state.clone().unwrap().last_activity_time,
        },
        self.config.gas_to_check_game,
        0,
        self.config.time_to_move / 3000,
    )
    .expect("Error in sending delayed message");
    Ok(Event::GameStarted)
}
```

Every player move is the command message sent to the program:

1. Pass: skip the turn if there is no tile to place.
2. Turn: place selected tile to the selected track. Additionally, in certain circumstances the player may get their train back.

On a successful turn or pass, a delayed message is sent to check if the next player has made a move. This is done in order to thoroughly check the state of the game every `time_on_move` 

```rust title="tequila-train/src/lib.rs"
pub fn check_game(
    &mut self,
    game_id: ActorId,
    last_activity_time: u64,
) -> Result<Event, Error> {
    let program_id = exec::program_id();
    if msg::source() != program_id {
        return Err(Error::OnlyProgramCanSend);
    }
    let game = self
        .games
        .get_mut(&game_id)
        .ok_or(Error::GameDoesNotExist)?;

    let game_state = game
        .game_state
        .as_mut()
        .ok_or(Error::GameHasNotStartedYet)?;

    // use the `last_activity_time` variable as an identifier of whether a move has been made
    if game_state.last_activity_time == last_activity_time {
        let current_player = game_state.current_player;
        game_state.players[current_player as usize].lose = true;
        // count how many players are left in the game
        let count_players_is_live = game_state
            .players
            .iter()
            .filter(|&player| !player.lose)
            .count();

        if count_players_is_live > 1 {
            // change the current player to the next player who has not dropped out of the game
            game_state.current_player = game_state
                .next_player(current_player)
                .expect("Live players more than 0");
            // change the time of last activity
            game_state.last_activity_time = exec::block_timestamp();
            msg::send_delayed(
                program_id,
                Command::CheckGame {
                    game_id,
                    last_activity_time: game_state.last_activity_time,
                },
                0,
                self.config.time_to_move / 3000,
            )
            .expect("Error in sending delayed message");
        } else {
            let winner_index = game_state
                .next_player(current_player)
                .expect("Live players more than 0");
            let winner = game_state.players[winner_index as usize].id;
            let prize = game.bid;
            if game.bid != 0 {
                send_value(winner, prize * game.initial_players.len() as u128);
            }

            game.state = State::Winners(vec![winner]);
            msg::send(
                winner,
                Ok::<Event, Error>(Event::GameFinished {
                    winners: vec![winner],
                    all_participants: game.initial_players.clone(),
                }),
                0,
            )
            .expect("Error in sending message");
        }
    }
    Ok(Event::Checked)
}
```

User interface gets the program state after every action and renders it in the browser.

## Program metadata and state
Metadata interface description:

```rust title="tequila-train/io/src/lib.rs"
pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = In<Config>;
    type Handle = InOut<Command, Result<Event, Error>>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = InOut<StateQuery, StateReply>;
}

```
One of Gear's features is reading partial states.

```rust title="tequila-train/io/src/lib.rs"
pub enum StateQuery {
    All,
    GetGame { player_id: ActorId },
}
```

```rust title="tequila-train/io/src/lib.rs"
pub enum StateReply {
    All(GameLauncherState),
    Game(Option<(Game, Option<u64>)>),
}
```

To display the program state information, the `state()` function is used:

```rust title="tequila-train/src/contract.rs"
#[no_mangle]
extern fn state() {
    let game_launcher = unsafe {
        GAME_LAUNCHER
            .take()
            .expect("Game launcher is not initialized")
    };
    let query: StateQuery = msg::load().expect("Unable to load the state query");
    let reply = match query {
        StateQuery::All => StateReply::All(game_launcher.into()),
        StateQuery::GetGame { player_id } => {
            if let Some(creator_id) = game_launcher.players_to_game_id.get(&player_id) {
                let game_reply = game_launcher
                    .games
                    .get(creator_id)
                    .map(|game| {
                        let last_activity_time_diff = game.game_state.as_ref().and_then(|state| {
                            (game_launcher.config.time_to_move as u64)
                                .checked_sub(exec::block_timestamp() - state.last_activity_time)
                        });
                        (game.clone(), last_activity_time_diff)
                    })
                    .map(Some)
                    .unwrap_or(None);

                StateReply::Game(game_reply)
            } else {
                StateReply::Game(None)
            }
        }
    };
    msg::reply(reply, 0).expect("Failed to encode or reply with the game state");
}
```

## Source code

The source code of this example of Tequila-train Game program and the example of an implementation of its testing is available on [gear-foundation/dapp/contracts/tequila-train](https://github.com/gear-foundation/dapps/tree/master/contracts/tequila-train).

See also an example of the program testing implementation based on `gtest`: [gear-foundation/dapps/tequila-train/tests](https://github.com/gear-foundation/dapps/tree/master/contracts/tequila-train/tests).

For more details about testing programs written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
