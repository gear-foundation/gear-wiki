---
sidebar_position: 14
---

# Contract State: initialization, migration and upgrade

Sometimes it becomes necessary to transfer the state of our contract to another contract. Using the fungible token contract as an example, here are three ways to do this

## Set state on Initialization

To set state on contract initialization we change our Init message:


`io/src/lib.rs`
```rust
pub enum Initialize {
    Config(InitConfig),
    State(IoFungibleToken),
}
```

Also, we change the initialization function by adding a check for the message type. 

`src/contract.rs`
```rust
#[no_mangle]
extern "C" fn init() {
    let init: Initialize = msg::load().expect("Unable to decode InitConfig");

    let ft = match init {
        Config(config) => FungibleToken {
            name: config.name,
            symbol: config.symbol,
            decimals: config.decimals,
            ..Default::default()
        },
        State(io_ft) => FungibleToken::prepare_new_state(io_ft),
    };

    unsafe { FUNGIBLE_TOKEN = Some(ft) };
}
```

If the message type is Config, then we create the contract as before: with config parameters and default parameters. But if message type is `Initialize::State`, then we convert the incoming data into the state of the contract in function `prepare_new_state`:

`src/contract.rs`
```rs
fn prepare_new_state(new_state: IoFungibleToken) -> Self {
    let IoFungibleToken {
        name,
        symbol,
        total_supply,
        balances,
        allowances,
        decimals,
    } = new_state;

    let allowances = allowances
        .into_iter()
        .map(|(actor_id, allows)| {
            let allows = allows.into_iter().collect();
            (actor_id, allows)
        })
        .collect();

    Self {
        name,
        symbol,
        total_supply,
        balances: balances.into_iter().collect(),
        allowances,
        decimals,
    }
}
```

## Upgrade state on message handle

Similar as on Init, to migrate the state of the contract when sending a message, we must add a new type of message and add its handling

`io/src/lib.rs`
```rs
pub enum FTAction {
    Mint(u128),
    Burn(u128),
    Transfer {
        from: ActorId,
        to: ActorId,
        amount: u128,
    },
    Approve {
        to: ActorId,
        amount: u128,
    },
    TotalSupply,
    BalanceOf(ActorId),
    UpgradeState(IoFungibleToken), // add new action
}
```

`src/contract.rs`
```rs
#[no_mangle]
extern "C" fn handle() {
    let action: FTAction = msg::load().expect("Could not load Action");
    let ft: &mut FungibleToken = unsafe { FUNGIBLE_TOKEN.get_or_insert(Default::default()) };
    match action {
        // ...
        FTAction::UpgradeState(new_state) => {
            let new_ft = FungibleToken::prepare_new_state(new_state);
            unsafe { FUNGIBLE_TOKEN.insert(new_ft) };

            msg::reply(FTEvent::StateUpdated, 0).unwrap();
        }
    }
}
```

## Migrate state on message handle

Similar as on Init, to migrate the state of the contract when sending a message, we must add a new type of message and add its handling

`io/src/lib.rs`
```rs
pub enum FTAction {
    Mint(u128),
    Burn(u128),
    Transfer {
        from: ActorId,
        to: ActorId,
        amount: u128,
    },
    Approve {
        to: ActorId,
        amount: u128,
    },
    TotalSupply,
    BalanceOf(ActorId),
    UpgradeState(IoFungibleToken), // add new action
    MigrateState(ActorId), // add one more new action
}
```

`src/contract.rs`
```rs
#[no_mangle]
extern "C" fn handle() {
    let action: FTAction = msg::load().expect("Could not load Action");
    let ft: &mut FungibleToken = unsafe { FUNGIBLE_TOKEN.get_or_insert(Default::default()) };
    match action {
        // ...
        FTAction::MigrateState(program_id) => {
            let ft = common_state();
            let upgrade_state = FTAction::UpgradeState(ft);

            // sending state to another contract
            msg::send(program_id, upgrade_state, 0).expect("Error at sending upgrade");

            msg::reply(FTEvent::StateMigrated, 0).expect("Error at sending reply");
        }
    }
}
```
