---
sidebar_label: Tamagotchi
sidebar_position: 7
---

# Tamagotchi

Tamagotchi is a popular virtual pet game that was created in Japan in the late 1990s. This game provides an opportunity to care for a virtual pet, which is a tiny digital creature that lives on the screen of the device.

The main purpose of the game is to provide care, nurturing and care for your Tamagotchi. The pet requires constant attention: you need to feed it, groom it, play with it and monitor its overall condition. If you don't pay enough attention to your Tamagotchi, it may even die.

The game develops responsibility and care in the player, and promotes time management skills. Tamagotchi has become an iconic game and has many different versions and modifications. 

The article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own application and run it on the Vara Network. The source code is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/tamagotchi).

## How to run

1. Build a contract
> Additional details regarding this matter can be located within the [README](https://github.com/gear-foundation/dapps/tree/master/contracts/tamagotchi/README.md) directory of the contract.

2. Upload the contract to the [Vara Network Testnet](https://idea.gear-tech.io/programs?node=wss%3A%2F%2Ftestnet.vara.rs)
> Further details regarding the process of contract uploading can be located within the [Getting Started](../../getting-started-in-5-minutes/#deploy-your-smart-contract-to-the-testnet) section.

3. Build and run user interface 
> More information about this can be found in the [README]() directory of the frontend.

## Implementation details

### Tamagotchi contract description

The Tamagotchi contract contains the following information

```rust title="tamagotchi/src/lib.rs"
struct Tamagotchi {
    name: String,
    date_of_birth: u64,
    owner: ActorId,
    fed: u64,
    fed_block: u64,
    entertained: u64,
    entertained_block: u64,
    rested: u64,
    rested_block: u64,
}
```
* `name` - pet name
* `date_of_birth` - pet's date of birth  
* `owner` - pet owner 
* `fed` - is the level of satiety
* `fed_block` - is the last feeding time
* `entertained` - is the level of entertainment satisfaction
* `entertained_block` - is the time of last entertainment
* `rested` - is the level of relaxation
* `rested_block` - is the final resting time

### Initialization

To initialize a game contract, it is only necessary to provide the pet's name.

```rust title="tamagotchi/io/src/lib.rs"
pub struct TmgInit {
    pub name: String,
}
```

During initialization, the pet is created with a complete set of all states.

```rust title="tamagotchi/src/lib.rs"
#[no_mangle]
extern fn init() {
    let TmgInit { name } = msg::load().expect("Failed to decode Tamagotchi name");
    let current_block = exec::block_timestamp();

    let tmg = Tamagotchi {
        name,
        date_of_birth: current_block,
        owner: msg::source(),
        fed: MAX_VALUE,
        fed_block: current_block,
        entertained: MAX_VALUE,
        entertained_block: current_block,
        rested: MAX_VALUE,
        rested_block: current_block,
    };
    unsafe {
        TAMAGOTCHI = Some(tmg);
    }
}
```

### Action

The Tamagotchi contract offers the following activities:

```rust title="tamagotchi/io/src/lib.rs"
pub enum TmgAction {
    // get a pet name
    Name,
    // get the age of the pet
    Age,
    // feed the pet
    Feed,
    // play with the pet
    Play,
    // let the pet sleep
    Sleep,
    // get basic information about the pet
    TmgInfo,
}
```

### Reply

For each activity, the program responds with the following replies:

```rust title="tamagotchi/io/src/lib.rs"
pub enum TmgReply {
    Name(String),
    Age(u64),
    Fed,
    Entertained,
    Slept,
    TmgInfo {
        owner: ActorId,
        name: String,
        date_of_birth: u64,
    },
}
```

Before proceeding with any action, it is necessary to check whether the pet is alive. For this purpose, values indicating the health of the pet are calculated

```rust title="tamagotchi/src/lib.rs"

fn calculate_hunger(&self) -> u64 {
    HUNGER_PER_BLOCK * ((exec::block_timestamp() - self.fed_block) / 1_000)
}

fn calculate_boredom(&self) -> u64 {
    BOREDOM_PER_BLOCK * ((exec::block_timestamp() - self.entertained_block) / 1000)
}

fn calculate_energy(&self) -> u64 {
    ENERGY_PER_BLOCK * ((exec::block_timestamp() - self.rested_block) / 1000)
}

```

If the value of all three tamagotchi state parameters is too high, the tamagotchi will die

```rust title="tamagotchi/src/lib.rs"
fn tmg_is_dead(&self) -> bool {
    let fed = self.fed.saturating_sub(self.calculate_hunger());
    let entertained = self.entertained.saturating_sub(self.calculate_boredom());
    let rested = self.rested.saturating_sub(self.calculate_energy());
    fed == 0 && entertained == 0 && rested == 0
}
```

## Program metadata and state
Metadata interface description:

```rust title="tamagotchi/io/src/lib.rs"
pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = In<TmgInit>;
    type Handle = InOut<TmgAction, TmgReply>;
    type Reply = ();
    type Others = ();
    type Signal = ();
    type State = Out<Tamagotchi>;
}
```

To display the contract state information, the `state()` function is used:

```rust title="tamagotchi/src/lib.rs"
#[no_mangle]
extern fn state() {
    let tmg = unsafe { TAMAGOTCHI.take().expect("Unexpected error in taking state") };
    msg::reply(tmg, 0).expect("Failed to share state");
}

```

## Source code

The source code of this example of Tamagotchi smart contract and the example of an implementation of its testing is available on [gear-foundation/dapp/contracts/tamagotchi](https://github.com/gear-foundation/dapps/tree/master/contracts/tamagotchi).
