---
sidebar_position: 3
sidebar_label: Gear Distinctive Features
---

# Gear Distinctive Features

## Truly decentralized

One of the well-known drawbacks of other-platform’s smart contracts is that they cannot trigger their own functions. Instead, to run certain functions they require an external component or service to trigger on-chain transactions. 

While some smart contract logic may rely on users to initiate transactions and awaken the contract, many cases require a trigger when certain conditions are met, such as reaching a specific point in time or the occurrence of a particular event. In the past, this has either limited the capabilities of smart contracts or required developers to introduce a centralized service to trigger smart contracts.

Now thanks to Gear Protocol's support for asynchronous messaging, contract developers can implement arbitrary contract logic with [delayed messages](/docs/developing-contracts/delayed-messages.md) that can wake the contract after a specified period of time or in response to certain events. This enables a much more extensive range of use cases for smart contracts, unlocks new decentralized functionality, and unlocks more value for users in the blockchain ecosystem.

## Continuing messaging automation

The execution of any messages in Gear, including the [system messages](../developing-contracts/system-signals.md)), consumes "gas". The Gear Protocol introduces the concept of [gas reservation](/docs/developing-contracts/gas-reservation.md), which allows for the creation of gas pools that can be used by programs for further execution. Each pool is unique to the program that creates it, and the gas from the pool can be consumed by the program if its "gas_available" is not sufficient.

One of the key benefits of gas reservation is the ability to send **delayed messages** that can be triggered automatically at a specific time in the future. These messages, like any other message in Gear, can invoke a user or another smart contract in the network.

Perhaps most interestingly, gas reservation allows a program to send a message to itself at a later time, allowing it to continue execution after a defined period. This effectively enables a smart contract to execute itself an **unlimited** number of times (provided that enough gas is available for the execution).


This opens up a wide range of possibilities for the implementation of functional logic related to **continuing messaging automation** in smart contracts. Delayed messages are similar to cron jobs, which cannot be implemented in smart contracts on other blockchain platforms without the use of external resources. The remarkable advantage of this solution is that it eliminates the need for centralized components in dApps, ensuring they function **completely on-chain** and are fully decentralized.


## Use cases

For instance, let's consider some use case examples that become achievable:

### NFTs

Non-Fungible Tokens (NFTs) are unique digital assets that can be owned and traded on blockchain networks. One of the key features of NFTs is that they can be dynamic, meaning that their properties can be changed based on certain conditions. Dynamic NFTs can be updated immediately by their owner or gradually using delayed messages.

This can be useful in a variety of situations, such as updating an NFT based on changes in its price, as is done in the Curse NFT using Oracles, or in gaming applications where the properties of an NFT might change over time.

There are scenarios in which NFTs are updated:
- The user can send a message to update the NFT immediately
- The NFT contract can send a message to itself at regular intervals to update the token's properties
- The NFT contract can send a delayed message to another actor (such as a program or account) and change the NFT's properties based on the result of processing that message.

Overall, the ability to update NFTs dynamically opens up a wide range of possibilities for their use in a variety of applications.

### Gaming

Tamagotchi is a classic digital pet game where players must care for a virtual creature by providing it food, attention, and other forms of care. As a dynamic NFT, a Tamagotchi can change its appearance based on its properties (such as hunger, fatigue, or happiness) and can notify the user when it needs to be fed or played with. The user can feed the NFT with gas, which is used to send delayed messages that are required to update the Tamagotchi's state.

"Game strategies battle" is a game in which several programs compete with each other using different algorithms or strategies. The game can be based on a variety of classic games, such as checkers, tic-tac-toe, races, or monopoly. Each participant creates a smart contract with their own game strategy and uploads it to the blockchain. The programs then play against each other until someone wins or the gas runs out. If the gas runs out, one of the participants can continue the game by sending a message with more gas. This allows the game to continue indefinitely, with the most effective strategy ultimately emerging as the winner.

### DeFi

Decentralized finance (DeFi) applications can improve the user experience by implementing delayed messages. For example, when users deposit tokens into a liquidity pool on an automated market maker (AMM) or participate in staking to earn rewards, they often have to manually claim their earnings (known as "harvesting yield").

With the Gear Protocol, users can enjoy a set-and-forget DeFi experience where their earnings are automatically deposited into their accounts without any manual intervention. Rewards are regularly harvested, swapped for the original vault asset, and deposited again for compound farming, allowing users to earn even more without having to take any additional action.

In general, the use of delayed messages in DeFi can greatly improve the user experience by making it easier for users to earn rewards and take advantage of the benefits of DeFi without constantly having to monitor and manage their assets. This can help drive broader adoption of DeFi and unlock new opportunities for growth in the industry.