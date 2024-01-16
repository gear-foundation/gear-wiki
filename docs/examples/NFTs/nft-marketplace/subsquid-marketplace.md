---
sidebar_label: Subsquid indexing
sidebar_position: 2
---

# Subsquid-based data indexing for NFT Marketplace

Creating a good and usable frontend for an NFT marketplace web-application requires an indexer of on-chain programs. It will enable historical data to be displayed in the fastest way possible. Subsquid helps to achieve this goal.

Explore the [Subsquid documentation](https://docs.subsquid.io/overview/) to learn about their architecture

Historical data that needs to be indexed, stored, and displayed in the user interface can be (but not limited to):

- Token transfers between accounts
- Auctions and their bids
- Offers to buy tokens

A dApp developer may also want to store other parameters of NFTs, such as - the token owner, the token description, links to media and other references too. With Subsquid, these data points can be quickly accessed without having to query the state of the programs on-chain.

Subsquid provides two main components:

- An Archive that indexes all blockchain calls and events.
- A Squid that gets the data from the Archive and implements specific business logic.

The Archive works out of the box so we focused on the development of the Squid.

The Squid includes, firstly, a processor that receives data from the Archive and creates its own entities that are stored in a database and secondly, GraphQL API through which the data can be retrieved. As for the latter, Subsquid provides a package that can be used to run the GraphQL API without any additional implementation.

The Processor must be developed as a regular NodeJS package.

Subsquid provides a set of packages that facilitate the development process.

Firstly, community developers created a GraphQL scheme describing all entities and relations between them. [Here](https://github.com/gear-foundation/integrations-subsquid/blob/master/Subsquid/nft-marketplace/schema.graphql) is an example of a scheme that can be used to generate Typeorm models for a database using the `@subsquid/typeorm-codegen` package provided by Subsquid. They chose a Postgres database for storing all the data.

The next step is to create the Processor.

Subsquid provides a really simple way to obtain data from an Archive. Using `@subsquid/substrate-processor` you can easily subscribe to necessary data. The Class `SubstrateBatchProcessor` lets you select the range of blocks that you want to index and specify the event or extrinsic that you want to receive.

In the community developer’s cases, they only used `UserMessageSent` events, because they contained all the necessary data.

The payloads of messages received through the processor are represented as bytes and require program metadata to decode the bytes. The class called [Meta](https://github.com/gear-foundation/integrations-subsquid/blob/master/Subsquid/nft-marketplace/src/meta.ts) was created to decode these bytes.

The `SubsquidBatchProcessor` operates by returning data in batches. To minimize the number of read/write operations in the database, it is advisable to compile and prepare all the data within each batch and subsequently save it after the entire batch has been processed. A [BatchState](https://github.com/gear-foundation/integrations-subsquid/blob/master/Subsquid/nft-marketplace/src/state.ts) class was introduced to facilitate this, storing the prepared data until it is ready to be written into the database.

In case a new NFT program is registered in the marketplace, you may want to index it to get all its historical data. To do this, the [indexNft](https://github.com/gear-foundation/integrations-subsquid/blob/master/Subsquid/nft-marketplace/src/indexNft.ts) function was created to query the relevant data from the Archive and write it into the database.

The source code of the Subsquid-based indexer components is available on GitHub [here](https://github.com/gear-foundation/integrations-subsquid/tree/master/Subsquid).

The separate implementation of the NFT marketplace application example that is using indexing data via Subscquid is available in: `TBD`

