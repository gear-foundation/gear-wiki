---
sidebar_label: Gasless and Signlesss
sidebar_position: 3
---

# Gasless and Signlesss Transactions

Gear Protocol's introduction of gasless transactions, along with signless user interactions, presents a groundbreaking concept in the Web3 sphere. This innovation is revolutionizing communication within Gear-powered networks and boosting the adoption of decentralized applications. By making their usability comparable to Web2 services and applications, Gear Protocol significantly enhances user experience in the decentralized space.

This innovative feature empowers actors to issue [vouchers](/api/vouchers.md) that enable specific users to send messages to designated programs without incurring gas fees. This paradigm-shifting approach fosters a sponsorship-like environment for users, transforming the way interactions take place in the Web3 ecosystem. 

An example of using vouchers is shown in the [Battleship](/examples/Gaming/Battleship/battleship.md) game. Users without tokens in their balance can interact with a program by sending messages using a voucher, freeing them from the need to sign every transaction when interacting with the blockchain.

## Understanding Gasless Transactions

At the core of the Gasless Transactions feature lies the concept of vouchers. These vouchers are crafted to grant users the ability to send messages to specific programs within the network, all without the burden of gas fees. Each voucher comes with a predetermined allocation of gas, empowering users to initiate interactions without worrying about transaction costs.

## How Gasless Transactions Work

1. **Voucher Issuance**: Actors within the Vara Network can issue vouchers, creating a sponsorship mechanism for users. These vouchers are tied to specific programs and include a designated gas allocation.

2. **Message Sending**: Holders of valid vouchers can use them to send messages to the designated program. These messages can include instructions or data, enriching interactions within the network.

3. **Gas-Free Interactions**: Users who has valid vouchers can enjoy gas-free interactions when sending messages. The allocated gas from the voucher covers the associated transaction costs.

Learn how to create and use vouchers in [this article](/docs/api/vouchers.md).

## Signless dApp Interactions

The signless transaction introduces another feature: anyone can interact with the dApp without needing to sign in. The dApp transaction operates in a manner similar to the steps outlined above, with one difference — a voucher is issued not directly to a user, but to a temporarily created account (sub-account) to which the user grants temporary rights to sign transactions on their behalf in this application.

Vara's signless transactions further enhance the user experience. These transactions allow users to interact with dApps for a certain period without the need to individually sign each transaction. By eliminating the repetitive signing process, this approach streamlines interactions and significantly improves the overall UX efficiency.

## Benefits of Gasless and Signless Transactions

- Improved User Experience: The signless and gasless features simplify the interaction process, making it more accessible and user-friendly, akin to Web2 experiences. This attracts new users who might be daunted by the complexities of token management.
- Enhanced User Privacy: Users are not required to disclose their token balances when interacting with dApps, thus protecting their financial privacy. Individuals can contribute health data to research studies without revealing their identities. Additionally, signless dApps could facilitate anonymous voting systems, enhancing privacy and security for voters in elections.