---
sidebar_position: 3
sidebar_label: Gear Distinctive Features
---

# Gear Distinctive Features

## Truly decentralized

One of the well-known drawbacks of other-platform’s smart contracts is that they cannot trigger their own functions. Instead, to run certain functions they need to be triggered via on-chain transactions by an external component or a service.

Some smart contract logic can rely on users to initiate transactions waking up the contract, but in many cases a smart contract function requires a trigger when certain conditions are met. It relates to reaching a defined moment in time or a specific event occurrence.

Previously it was led to either poor smart contract capabilities or developers tried to solve it by introducing an external centralized service for triggering smart contracts.

Now with native Gear Protocol’s async messaging support, a contract developer is able to implement an arbitrary logic of the contract with delayed messages that will wake the contract itself after a certain period of time or by some event.

It enables extensive smart contract use cases, unlocks entirely new decentralized functionality and brings more value to users that weren’t previously possible in the blockchain ecosystems.

## Continuing messaging automation

The execution of any messages in Gear (including the system messages) consumes gas. The Gear Protocol introduces a **gas reservation** feature which can be very useful for implementation of a variety modern use cases. 

Briefly gas reservation is a special pool with gas that can be used by a program for further executions. Each pool is created per-program and has a unique identifier used by a program. Gas from this pool can be consumed for program's execution if the program's `gas_available` is not enough.

One of the unique features that become possible using pool with reserved gas is an ability of sending **messages delayed in time automatically**. As any other messages, the delayed message can invoke any actor in the network - a user or another smart contract.

But the most interesting option opened by this functionality is an ability for a program to continue execution later after a defined period of time by sending a message to itself. In fact, a smart-contract is able to execute itself **unlimited** number of blocks (provided that enough gas for execution is kept available). 

This opens up wide opportunities for the implementation of functional logic related to the **continuing messaging automation** in smart-contracts. The delayed messages are essentially similar to cron jobs, which can not be implemented in smart contracts on other blockchains without the help of external resources. The remarkable effect of this solution is that it eliminates the need of having centralized components for dApps making them functioning **totally on-chain** providing true decentralization to the world.

## Use cases

Let's consider some use case examples that become achievable using asynchronous programming approach and delayed messaging support:

### NFTs

NFT can be dynamic - it can change its properties based on some conditions. Dynamic NFT can be updated immediately by the owner or gradually using delayed messages. It can be useful, for example in case when the NFT should be changed based on its price changes (Curse NFT uses Oracle for that) as well as in gaming applications.

The scenarios for updating the NFT can be the following:
- User sends a message for updating the NFT instantly
- NFT contract sends a message to itself at regular intervals in order to update the token properties
- NFT contract sends a delayed message to another actor (program or account) and changes the NFTs properties based on the result of processing that message

### Gaming

Tamagotchi game - a digital pet that requires care. As a dynamic NFT, Tamagotchi can change its appearance based on its properties - hungry, tired, happy etc. It also can notify the user about the need to feed or play. The user feeds the NFT with gas that is used for delayed messages that are required to update the Tamagotchi.

Game strategies battle - when several programs play with each other and the most effective game strategy/algorithm wins - checkers, tic-tac-toe, races, monopoly etc. Each participant creates a smart contract with its own strategy of the game. Participants upload their contracts on-chain and start the game between them. Programs play until someone wins or the gas runs out. If the gas runs out, one of the participants can continue the game from the place where it was interrupted, sending a message with more gas.

### DeFi

Decentralized finance applications can improve their user experience by introducing delayed messages. For example, those who have depositing tokens into a liquidity pool on an AMM or participate in nomination by staking their tokens, to claim rewards usually they need to go and manually Claim their earnings (harvesting yield).
Gear Protocol enables set-and-forget DeFi user experience - users receive earnings directly in their accounts without any manual intervention. Rewards are regularly harvested, swapped for the original vault asset, and deposited again for compound farming.