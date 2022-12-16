---
sidebar_label: Gear Feeds
sidebar_position: 7
---

# Introduction
In order to introduce our rapidly growing community to the platform developed by Gear, we've developed a dApplication in order to showcase some of the features that can be implemented using our smart contracts. Specifically, this contract aims to build a platform simillar to Twitter: each user can have their own "feed", "feeds" can be subscribed to and the landing page contains global & personal "feeds".

This article explains the programming interface, data structure, basic functions and explains their purpose. It can be used as is or modified to suit your own scenarios. Anyone can easily create their own application and run it on the Gear Network. The source code is available on [GitHub](https://github.com/gear-dapps/feeds). 

# Feeds dApp composition
The application strcture consists of two smart contracts: the router contract and the channel contract. There's one router contract per application and one channel contract per user.

The router contract has a very straightforward purpose: it records instantiation of new channel contracts and verifies their validity. Thus, it only contains one action: Register, which is invoked by the owner of a channel contract that needs to be added.

The channel contract is a little more complex: it is responsible for handling posts being added to its feed, keeping track of subscribers and providing meta information about itself.

# Interaction flow
Here's a schema of how the contracts are connected to each other:

![img alt](./img/feeds-outline.png)

Let's now go through the flow of the application step by step.

First, channel owner should compile their own version of the contract filled in with information about the channel. Then, when the contract is uploaded to the network via the [Gear Idea portal](https://idea.gear-tech.io), owner of the contract should send a `Register` message to the router contract. Once router contract receives that message, it sends a `Meta` request to the recently deployed contract to verify that it has been set up correctly. If the channel contract responds properly, it is added to the list of available channels.

If you want to check out the code available for both the router and the channel contracts, you can find them here: [router](https://github.com/gear-dapps/feeds/tree/master/router), [channel](https://github.com/gear-dapps/gear-feeds-channel).

# The Gear Feeds website

The Demo Gear Feeds application is avaialble at **[https://workshop.gear-tech.io](https://workshop.gear-tech.io)**.

First, log in using your [Polkadot.js extension wallet](https://polkadot.js.org/extension/).

![img alt](./img/log-in.png)

Now, you can browse a list of all channels.

![img alt](./img/show-all.png)

If you have uploaded your own contract under the same ID you've logged in to the website with, you should be able to see it under `my channel`.

![img alt](./img/channels.png)

When viewing your own channel, you can add posts to it (you will have to conduct a transaction). All the subscribers will see the posts in their personal feeds.

![img alt](./img/my-channel.png)

# Conclusion
Gear Feeds is an example of a full-fledged application with core logic being in a decentralized application implemented via Smart Contracts on Gear. We hope to see more exciting projects inspired by Gear feeds and recent platform improvements created by our community members! :)

The source code for both Channel and Routar is available on [GitHub](https://github.com/gear-dapps/feeds).

For more details about testing smart contracts written on Gear, refer to this article: [Program Testing](/docs/developing-contracts/testing).
