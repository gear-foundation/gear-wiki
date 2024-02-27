---
sidebar_label: Galactic Express
sidebar_position: 6
---

# Galactic Express Game

![galactic-express](../img/galactic-express.png)

Galactic Express is a game in which players guide a rocket into space, testing its endurance as it collides with random obstacles. An unpredictable and exciting journey, it challenges players to test their luck and adapt to ever-changing obstacles.

Taking their luck into their own hands, players guide a rocket into outer space, facing challenges such as dynamic weather conditions and varied flight circumstances, making each gameplay experience an exciting adventure.
Players' strategic decisions about fuel allocation and target gains significantly affect the rocket's path, making each playthrough of the game unique.

The article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own application and run it on the Vara Network. The source code is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/galactic-express).

Everyone can play the game via this link - [Play Galactic Express](https://galactic-express.vara.network/).

## How to run the app locally

1. Build a program
> Additional details regarding this matter can be located within the [README](https://github.com/gear-foundation/dapps/tree/master/contracts/galactic-express/README.md) directory of the program.

2. Upload the program to the [Vara Network Testnet](https://idea.gear-tech.io/programs?node=wss%3A%2F%2Ftestnet.vara.network)
> Further details regarding the process of program uploading can be located within the [Getting Started](../../getting-started-in-5-minutes#deploy-your-program-to-the-testnet) section.

3. Build and run user interface
> More information about this can be found in the [README](https://github.com/gear-foundation/dapps/blob/master/frontend/apps/galactic-express/README.md) directory of the frontend.

## Implementation details

### Program description

The program contains the following information

```rust title="galactic-express/src/lib.rs"

struct Contract {
    games: HashMap<ActorId, Game>,
    player_to_game_id: HashMap<ActorId, ActorId>,
}
```
* `games` - list of all games according to the address of the game's creator
* `player_to_game_id` - list of players and the games in which they participate

Where the `Game` is as follows:

```rust title="galactic-express/src/lib.rs"
pub struct Game {
    admin: ActorId,
    admin_name: String,
    bid: u128,
    altitude: u16,
    weather: Weather,
    reward: u128,
    stage: Stage,
}
```

* `admin` - game administrator's address
* `admin_name` - administrator name
* `bid` - gaming bet 
* `altitude` - flight altitude of the session
* `weather` - session weather conditions
* `reward` - session award
* `stage` - current state of play

There are two possible states: one during the registration stage and the other when the final results are already available

```rust title="galactic-express/io/src/lib.rs"
enum Stage {
    Registration(HashMap<ActorId, Participant>),
    Results(Results),
}
```

The `Participant` structure stores information about its address, name, fuel and payload amount

```rust title="galactic-express/io/src/lib.rs"
pub struct Participant {
    pub id: ActorId,
    pub name: String,
    pub fuel_amount: u8,
    pub payload_amount: u8,
}
```

The `Results` record all possible events during the players' turns, the number of scores they have earned and information about the participants

```rust title="galactic-express/io/src/lib.rs"
pub struct Results {
    pub turns: Vec<Vec<(ActorId, Turn)>>,
    pub rankings: Vec<(ActorId, u128)>,
    pub participants: Vec<(ActorId, Participant)>,
}
```

In flight, a rocket can either use up some amount of fuel or be destroyed by various space conditions, which are described in `HaltReason`

```rust title="galactic-express/io/src/lib.rs"
pub enum Turn {
    Alive { fuel_left: u8, payload_amount: u8 },
    Destroyed(HaltReason),
}
// ...
pub enum HaltReason {
    PayloadOverload,
    FuelOverload,
    SeparationFailure,
    AsteroidCollision,
    FuelShortage,
    EngineFailure,
}
```

### Initialization

This program has no input data for initialization, and anyone who uploads the program to the network automatically becomes an admin

```rust title="galactic-express/src/lib.rs"
fn process_init() -> Result<(), Error> {
    unsafe {
        STATE = Some((
            Contract {
                ..Default::default()
            },
            TransactionManager::new(),
        ));
    }

    Ok(())
}
```

### Action

```rust title="galactic-express/io/src/lib.rs"
pub enum Action {
    CreateNewSession {
        name: String,
    },
    CreateNewSession {
        name: String,
    },
    Register {
        creator: ActorId,
        participant: Participant,
    },
    CancelRegistration,
    DeletePlayer {
        player_id: ActorId,
    },
    CancelGame,
    LeaveGame,
    StartGame {
        fuel_amount: u8,
        payload_amount: u8,
    },
}
```

### Event

```rust title="galactic-express/io/src/lib.rs"
pub enum Event {
    AdminChanged(ActorId, ActorId),
    NewSessionCreated {
        altitude: u16,
        weather: Weather,
        reward: u128,
        bid: u128,
    },
    Registered(ActorId, Participant),
    RegistrationCanceled,
    PlayerDeleted {
        player_id: ActorId,
    },
    GameCanceled,
    GameFinished(Results),
    GameLeft,
}
```

### Logic

A new game session must be set up using `Action::CreateNewSession` to start the game.

Upon the inception of a new session, random values, encompassing aspects like weather conditions, altitude settings, fuel prices, and potential rewards, are dynamically generated.

```rust title="galactic-express/src/lib.rs"
fn create_new_session(&mut self, name: String) -> Result<Event, Error> {
    let msg_src = msg::source();
    let msg_value = msg::value();

    if self.player_to_game_id.contains_key(&msg_src) {
        return Err(Error::SeveralRegistrations);
    }

    let game = self.games.entry(msg_src).or_insert_with(|| Game {
        admin: msg_src,
        admin_name: name,
        bid: msg_value,
        ..Default::default()
    });

    let stage = &mut game.stage;

    match stage {
        Stage::Registration(participants) => {
            participants.clear();
        }
        Stage::Results { .. } => *stage = Stage::Registration(HashMap::new()),
    }

    let mut random = Random::new()?;

    game.weather = match random.next() % (Weather::Tornado as u8 + 1) {
        0 => Weather::Clear,
        1 => Weather::Cloudy,
        2 => Weather::Rainy,
        3 => Weather::Stormy,
        4 => Weather::Thunder,
        5 => Weather::Tornado,
        _ => unreachable!(),
    };
    game.altitude = random.generate(TURN_ALTITUDE.0, TURN_ALTITUDE.1) * TURNS as u16;
    game.reward = random.generate(REWARD.0, REWARD.1);
    self.player_to_game_id.insert(msg_src, msg_src);

    Ok(Event::NewSessionCreated {
        altitude: game.altitude,
        weather: game.weather,
        reward: game.reward,
        bid: msg_value,
    })
}
```

After successfully creating a new session, players can begin registration: `Action::Register(Participant)`

```rust title="galactic-express/src/lib.rs"
fn register(
    &mut self,
    creator: ActorId,
    participant: Participant,
    msg_source: ActorId,
    msg_value: u128,
) -> Result<Event, Error> {
    if self.player_to_game_id.contains_key(&msg_source) {
        return Err(Error::SeveralRegistrations);
    }

    if let Some(game) = self.games.get_mut(&creator) {
        if msg_value != game.bid {
            return Err(Error::WrongBid);
        }
        if let Stage::Results(_) = game.stage {
            return Err(Error::SessionEnded);
        }

        let participants = game.stage.mut_participants()?;

        if participants.contains_key(&msg_source) {
            return Err(Error::AlreadyRegistered);
        }

        if participants.len() >= MAX_PARTICIPANTS - 1 {
            return Err(Error::SessionFull);
        }

        participant.check()?;
        participants.insert(msg_source, participant.clone());
        self.player_to_game_id.insert(msg_source, creator);

        Ok(Event::Registered(msg_source, participant))
    } else {
        Err(Error::NoSuchGame)
    }
}
```
This function checks the game stage, the number of registered players and the participant's input data.

Input values of fuel and payload cannot be exceeded by predetermined values


```rust title="galactic-express/io/src/lib.rs"
// maximum fuel value that can be entered by the user
pub const MAX_FUEL: u8 = 100;
// maximum payload value that can be entered by the user
pub const MAX_PAYLOAD: u8 = 100;
// ...
impl Participant {
    pub fn check(&self) -> Result<(), Error> {
        if self.fuel_amount > MAX_FUEL || self.payload_amount > MAX_PAYLOAD {
            Err(Error::FuelOrPayloadOverload)
        } else {
            Ok(())
        }
    }
}
```

After players have successfully registered, the admin can initiate the game using the `Action::StartGame(Participant)` action. This action involves several checks on the admin, the number of participants, and their data.


```rust title="galactic-express/src/lib.rs"
async fn start_game(&mut self, fuel_amount: u8, payload_amount: u8) -> Result<Event, Error> {
    let msg_source = msg::source();

    let game = self.games.get_mut(&msg_source).ok_or(Error::NoSuchGame)?;

    if fuel_amount > MAX_FUEL || payload_amount > MAX_PAYLOAD {
        return Err(Error::FuelOrPayloadOverload);
    }
    let participant = Participant {
        id: msg_source,
        name: game.admin_name.clone(),
        fuel_amount,
        payload_amount,
    };

    let participants = game.stage.mut_participants()?;

    if participants.is_empty() {
        return Err(Error::NotEnoughParticipants);
    }
    participants.insert(msg_source, participant);

    let mut random = Random::new()?;
    let mut turns = HashMap::new();
// ...
```

Turns are automatically and randomly generated for each participant, which include three tests of luck.

These moves include both events beyond the control of the participant and events that could occur if the participant decides to take a risk by specifying more fuel and payload. More details about the math of the game can be found in the [README](https://github.com/gear-foundation/dapps/tree/master/contracts/galactic-express#math)


```rust title="galactic-express/src/lib.rs"
fn turn(
    turn: usize,
    remaining_fuel: u8,
    random: &mut Random,
    weather: Weather,
    payload: u8,
) -> Result<u8, HaltReason> {
    let new_remaining_fuel =
        match remaining_fuel.checked_sub((payload + 2 * weather as u8) / TURNS as u8) {
            Some(actual_fuel) => actual_fuel,
            None => return Err(HaltReason::FuelShortage),
        };

    match turn {
        0 => {
            // values in "chance" are transmitted as percentages
            if random.chance(3) {
                return Err(HaltReason::EngineFailure);
            }
            // this trap for someone who specified a lot of fuel
            if remaining_fuel >= PENALTY_LEVEL - 2 * weather as u8 && random.chance(10) {
                return Err(HaltReason::FuelOverload);
            }
        }
        1 => {
            // this trap for someone who specified a lot of payload
            if payload >= PENALTY_LEVEL - 2 * weather as u8 && random.chance(10) {
                return Err(HaltReason::PayloadOverload);
            }

            if random.chance(5 + weather as u8) {
                return Err(HaltReason::SeparationFailure);
            }
        }
        2 => {
            if random.chance(10 + weather as u8) {
                return Err(HaltReason::AsteroidCollision);
            }
        }
        _ => unreachable!(),
    }

    Ok(new_remaining_fuel)
}
```

If a participant crashes for any reason, the player receives zero points and, accordingly, loses the game. If the player successfully completes all three parts of the game, the points are counted to determine the winner.

```rust title="galactic-express/src/lib.rs"
let mut scores: Vec<(ActorId, u128)> = turns
    .iter()
    .map(|(actor, turns)| {
        let last_turn = turns.last().expect("there must be at least 1 turn");

        (
            *actor,
            match last_turn {
                Turn::Alive {
                    fuel_left,
                    payload_amount,
                } => (*payload_amount as u128 + *fuel_left as u128) * game.altitude as u128,
                Turn::Destroyed(_) => 0,
            },
        )
    })
    .collect();
```

## Program metadata and state
Metadata interface description:

```rust title="galactic-express/io/src/lib.rs"
pub struct ContractMetadata;

impl Metadata for ContractMetadata {
    type Init = Out<Result<(), Error>>;
    type Handle = InOut<Action, Result<Event, Error>>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = InOut<StateQuery, StateReply>;

```

To display the program state information, the `state()` function is used:

```rust title="galactic-express/src/contract.rs"
#[no_mangle]
extern fn state() {
    let (state, _tx_manager) = unsafe { STATE.take().expect("Unexpected error in taking state") };
    let query: StateQuery = msg::load().expect("Unable to load the state query");
    let reply = match query {
        StateQuery::All => StateReply::All(state.into()),
        StateQuery::GetGame { player_id } => {
            let game_state = state
                .player_to_game_id
                .get(&player_id)
                .and_then(|creator_id| state.games.get(creator_id))
                .map(|game| {
                    let stage = match &game.stage {
                        Stage::Registration(participants_data) => StageState::Registration(
                            participants_data.clone().into_iter().collect(),
                        ),
                        Stage::Results(results) => StageState::Results(results.clone()),
                    };

                    GameState {
                        admin: game.admin,
                        admin_name: game.admin_name.clone(),
                        altitude: game.altitude,
                        weather: game.weather,
                        reward: game.reward,
                        stage,
                        bid: game.bid,
                    }
                });

            StateReply::Game(game_state)
        }
    };
    msg::reply(reply, 0).expect("Unable to share the state");
}
```

## Source code

The source code of this example of Galactic-Express Game program and the example of an implementation of its testing is available on [gear-foundation/dapp/contracts/galactic-express](https://github.com/gear-foundation/dapps/tree/master/contracts/galactic-express).

See also an example of the program testing implementation based on `gtest`: [gear-foundation/dapps/galactic-express/tests](https://github.com/gear-foundation/dapps/tree/master/contracts/galactic-express/tests).

For more details about testing programs written on Gear, refer to the [Program Testing](/docs/developing-contracts/testing) article.
