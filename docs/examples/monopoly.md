---
sidebar_label: Monopoly game
sidebar_position: 23
---

# Monopoly game (Syndote)

Syndote is the name of a Monopoly-like decentralized game that works **completely on-chain**. It has no backend or any centralized components, the user interface interacts directly with the smart contract uploaded in the Gear Network. 

This is a "game strategies battle" where players compete with each other by implementing various playing strategies uploaded as smart-contracts into the network.

Syndote consists of Master contract and Player contracts. Master contract is the main contract that starts and controls the game. Player contracts implement the game strategies that can be unique for each participant of the game. 

After the game starts, all moves in the game take place automatically, but the UI provides an ability to jump to each one individually to analyze the player's strategy. To complete the game and determine the winner, many moves are required, which are processed over several blocks. In order for the Master contract to have enough gas to perform all the moves, the [gas reservation](../developing-contracts/gas-reservation) technology is used.

![img alt](./img/monopoly-1.png)

To launch the game, you need to:

- ⚒️ Build Master and Player contracts
- 🏗️ Upload the contracts to the network
- 🖥️ Build and run user interface

## ⚒️ Build Master and Player contracts

- Get the source code of [Master contract](https://github.com/gear-tech/syndote-game/tree/master/program/syndote) and [Player contract](https://github.com/gear-tech/syndote-game/tree/master/program/player).
- Modify Player's contract as you wish to achieve optimal game strategy.
- Build contracts as described in [program/README.md](https://github.com/gear-tech/syndote-game/blob/master/program/README.md#building-contracts).

## 🏗️ Upload contracts on chain

### Run Gear node locally

This is recommended while you are testing and debugging the program.

[Here](https://get.gear.rs/) you can find prepared binaries for Gear node.

```sh
./gear --dev --tmp --unsafe-ws-external --rpc-methods Unsafe --rpc-cors all
```

Upload and run Master and Player contracts and register players as described in [Running the game](#running-the-game) section.

### Run program in Gear Network

1. You can deploy contracts using [idea.gear-tech.io](https://idea.gear-tech.io/).
2. In the network selector choose Staging Testnet - wss://rpc-node.gear-tech.io network.
3. Upload and run Master and Player contracts.

## 🖥️ Build and run user interface

1. Download [this repository](https://github.com/gear-tech/gear-js) locally and run game application using instruction from [README.md](https://github.com/gear-tech/gear-js/tree/main/apps/syndote#readme).
2. Install packages:
```sh
yarn install
```
3. Declare environment variables - create new `.env` file, check `.env.example` file to get necessary variables.
4. Put the latest version of the `syndote.meta.wasm` file locally in `gear-js\apps\syndote\src\assets\wasm\` folder, replace if necessary.
:::note
In order for all features to work as expected, the node and its runtime version should be chosen based on the current `@gear-js/api` version. In case of issues with the application, try to switch to another network or run your own local node and specify its address in the `.env` file. When applicable, make sure the smart contract(s) wasm files are uploaded and running in this network accordingly.
:::
5. Run the app:
```sh
yarn start
```

## Run the game

### Run via User interface

1. Go to [idea.gear-tech.io](https://idea.gear-tech.io/), find your uploaded Master contract and click the `Send message` button.

![img alt](./img/monopoly-gas-reserve.png)

2. Currently the single gas reservation amount can be up to 245 000 000 000 since it is not yet possible to make a reservation more than the block gas limit (250 000 000 000). To make sure the Master contract has enough gas to run and complete the game, it is recommended to make at least 5-10 reservations.

3. Run the application locally as described in [Build and run user interface](#🖥️-build-and-run-user-interface).

4. Find Players contracts on idea.gear-tech.io and copy their Ids.

5. Register players in the application's interface one after another. Each player registration is a transaction that needs to be signed. It is possible to register up to 4 players.

6. Once everything is done, start the game via the `Play` button. You will see the game result almost instantly. Click `<` and `>` buttons to navigate through the game and check each separate move.

![img alt](./img/monopoly-2.png)

### Run directly on a local node

1. To run the game you have to deploy the Master contract and the Players contracts to the network (local node). During initialization the Master contract is filled with monopoly card information (cell cost, special cells: jails, lottery, etc).

2. Provide enough gas reservation for automatic play. Before each round the Master contract checks the amount of gas and if it is not enough it will send a message to the game admin to request for another gas reservation. To make a reservation you have to send to the master contract the following message:

```sh
GameAction::ReserveGas
```

3. Register the contracts of your players. For testing purposes you can upload the same player contract several times. Up to four players or less can be added in the Syndote Master contract.
To register the player you have to send the following message to the Syndote contract:

```sh
GameAction::Register {
    player: ActorId
}
```

4. After registering players, just start the game via sending the message:

```sh
GameAction::Play
```

5. If the game is not over, make more reservations and send a message `GameAction::Play` again. After the game is over, it's state becomes Finished and the admin can restart the game by starting a new player registration:

```sh
GameAction::StartRegistration
```

## Smart contracts
### Master contract

[Master contract](https://github.com/gear-dapps/syndote/tree/master/syndote) is initialized with monopoly card information (cell cost, special cells: jail, lottery). As was already mentioned, it is given enough gas reservation for automatic play. Before each player's step `Master` contract checks the amount of gas and if it is not enough it will send a message to the game admin to request for another gas reservation.  
**Players registration**:  
Players deploy their strategic contracts and send a message `Register` to `Master` contract. Master contract:
- Adds the players the list of participants and initializes it with the following structure:
```rust
struct PlayerInfo {
    position: 0,
	balance: 15000,
    debt: 0,
	in_jail: false,
	round: 0,
    cells: BTreeSet::new(),
    penalty: 0,
    lost: false,
}
```
- If the number of participants is 4, `Master` contract goes to the state of waiting for the start of the game.

When the required number of participants is reached, the admin sends a message `Play` to `Master` contract. This message starts an automated game that will scroll through the algorithms of the participants in turn:
- `Master`contract starts the round. Each round contains 4 steps (Each player makes one step). Before each step `Master` contract checks the states of the participants (whether they are bankrupt or may be there is already a winner);
- Each step contains the interaction with the strategic contract in turn:
- If the number of steps in the current round is 4, `Master` contract starts the following round. 

![img alt](./img/monopoly_play.png)

**Strategic messages:**  
[Strategic contracts](https://github.com/gear-dapps/syndote/tree/master/player) send strategic messages depending on the position on the monopoly field. A player may be in one of the following positions:
- A cell with his own property. A player has a right:
   - To add a gear on the cell. The gear can be `Bronze`, `Silver` or `Gold`;
   - To upgrade a gear (from `Bronze` to `Silver` and from `Silver` to `Gold`);
- Do nothing.
During actions `AddGear` and `Upgrade` a player can sell his other properties to the bank if he does not have enough balance.
- A cell with other properties. A player has to pay rent. If he has not enough balance, he can sell his properties to the bank. Otherwise he is declared bankrupt.
- Sell with properties which no one has bought yet. A player has a right:
  - Buy cell (with option to sell properties to the bank if not enough balance);
  - Do nothing.

- Jail. A player can throw the rolls. If it is double he gets out of the jail and his position is moved for the roll sum. If it is not a double a player can pay a fine or wait for the next round to throw the rolls again.
- Empty cells. In the `Master` contract there are cells that are not filled with anything. The developers themselves can expand the functionality of the game and add different game mechanics.

### Player's contract
`Player` is a contract in which the monopoly game strategy is implemented. It must meet the following requirements:
- It has to accept the following message from `Master` contract:
    ```rust
    pub struct YourTurn {
        pub players: BTreeMap<ActorId, PlayerInfo>,
        pub properties: BTreeMap<u8, (Vec<Gear>, Price, Rent)>,
    }
    ```
    That struct contains the information about the state of all players and about the monopoly fields and built gears.  
- Based on the information received, the strategic contract has to make a move (`BuyCell`, `AddGear`, `Upgrade`, `PayRent`, `ThrowRolls` etc). The move must be the asynchronous message to the monopoly contract.     
- The move has to be made correctly. For example, if a player is in an already occupied field and tries to buy it, then `Master`contract will fine him. Each wrong step is penalized with one point. If a player scores 5 penalty points, it is out of the game.  
- After the step a player has to send a reply to the monopoly contract. This way the monopoly contract knows about the completion of the step. The reply can be a simple empty message. 
- If a player's contract doesn’t reply, `Master` contract will remove that player from the game.
- `Master` contract gives a limited amount of gas per turn. That amount is quite enough for the move, but if the player's contract contains an incorrect logic (for example, an infinite loop), it will be removed from the game. 

