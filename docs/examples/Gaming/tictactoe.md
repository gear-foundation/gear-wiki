---
sidebar_label: Tic-Tac-Toe
sidebar_position: 9
---

# Tic-Tac-Toe

A classic and simple game in which the user competes against a smart contract operating on the blockchain network.

![Tic-Tac-Toe](../img/tictactoe.png)

Usually, the state of a smart contract advances as the application is utilized. A <u>distinctive feature</u> of this game's contract implementation is its capability to clean up its storage. In other words, as soon as the game session is completed and the results are recorded in the contract, all unnecessary data structures are purged through a special **delayed message**. [Delayed messages](/docs/developing-contracts/delayed-messages) represent one of the various unique features of the Gear Protocol.

The source code is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/tic-tac-toe). 
The [frontend application](https://github.com/gear-foundation/dapps/tree/master/frontend/tic-tac-toe) facilitates gameplay and interacts with the smart contract.
This article describes the program interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios.

Everyone can play the game via this link - [Play Tic-Tac-Toe](https://tictactoe.vara-network.io/) (VARA tokens are requred for gas fees).


