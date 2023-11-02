---
sidebar_label: Racing Cars
sidebar_position: 10
---

# Racing Cars - Algorithmic Game

The Racing Cars game revolves around a competition of smart contract algorithms. In essence, participants upload their personalized smart contract strategies, all managed by a central Master contract. These strategies are open to optimization and can be re-uploaded. 

![Racing Cars](../img/racingcars.png)

In a well-known Ethereum-based [0xMonaco](https://0xmonaco.ctf.paradigm.xyz/) game, central components were necessary to enable multi-block gameplay. However, in the case of Vara, the game operates <u>fully on-chain</u>, thanks to the asynchronous messaging paradigm. Various actors (contracts) communicate with each other, and if a game round can't be accommodated within a single block, it carries over into subsequent ones.

For this example version, the game was refined to enhance its appeal. The game entails a competition where a user races against two pre-uploaded smart contracts on the blockchain. Three cars vie to be the first to cross the finish line in several moves. Both the user and the contract algorithms decide their next move – whether to accelerate or sabotage another car to slow it down.

The source code for the game contract and algorithm examples are available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/car-races). 
The [frontend application](https://github.com/gear-foundation/dapps/tree/master/frontend/racing-car-game) facilitates gameplay and interacts with the smart contracts.
This article describes the program interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios.

Everyone can play the game via this link - [Play Racing Cars](https://racing.vara-network.io/) (VARA tokens are requred for gas fees).