---
sidebar_label: Subsquid indexing
sidebar_position: 2
---

# Subsquid-based data indexing for NFT Marketplace

Creating a good and usable frontend for an NFT marketplace web-application requires an indexer of on-chain programs. It will enable historical data to be displayed in the fastest way possible. Subsquid helps to achieve this goal.

You can look at the [Subsquid documentation](https://docs.subsquid.io/overview/) to learn what the Subsquid architecture is.

Historical data that needs to be indexed, stored, and displayed in the user interface can be (but not limited to):

- Token transfers between accounts
- Auctions and their bids
- Offers to buy tokens

A dApp developer may also want to store other parameters of NFTs, such as - the token owner, the token description, links to media and other references too. With Subsquid, these data points can be quickly accessed without having to query the state of the programs on-chain.

In general Subsquid provides two main components:

- An Archive that indexes all blockchain calls and events.
- A Squid that gets the data from the Archive and implements specific business logic.

The Archive works out of the box so we focused on the development of the Squid.

The Squid includes, firstly, a processor that receives data from the Archive and creates its own entities that are stored in a database and secondly, GraphQL API through which the data can be retrieved. As for the latter, Subsquid provides a package that can be used to run the GraphQL API without any additional implementation.

The Processor must be developed as a regular NodeJS package.

Subsquid provides a set of packages that facilitate the development process.

First of all, we need to create a GraphQL scheme describing all entities and relations between them. [Here](https://github.com/gear-tech/gear-integrations/blob/master/Subsquid/nft-marketplace/schema.graphql) is an example of a scheme that can be used to generate Typeorm models for a database using the `@subsquid/typeorm-codegen` package provided by Subsquid. We chose a Postgres database for storing all the data.

The next step is to create the Processor.

Subsquid provides a really simple way to obtain data from an Archive. Using `@subsquid/substrate-processor` you can easily subscribe to necessary data. The Class `SubstrateBatchProcessor` lets you select the range of blocks that you want to index and specify the event or extrinsic that you want to receive.

In our case we need only `UserMessageSent` events, because they contain all the necessary data.

The payloads of messages received through the processor are represented as bytes. We need program metadata to decode these bytes, so we’ve created a class called [Meta](https://github.com/gear-tech/gear-integrations/blob/master/Subsquid/nft-marketplace/src/meta.ts) that is responsible for decoding these bytes.

The `SubsquidBatchProcessor` returns the data in batches, so in order to avoid a large number of read/write operations in the database it’s better to prepare all the data in every batch and save it after the entire batch is processed. To achieve this goal we created a [BatchState](https://github.com/gear-tech/gear-integrations/blob/master/Subsquid/nft-marketplace/src/state.ts) class that is responsible for storing the prepared data before it is written into the database.

In case a new NFT program is registered in the marketplace, you may want to index it to get all its historical data. To do this we created [indexNft](https://github.com/gear-tech/gear-integrations/blob/master/Subsquid/nft-marketplace/src/indexNft.ts) function that queries the relevant data from the Archive and writes it into the database.

The source code of the Subsquid-based indexer components is available on GitHub [here](https://github.com/gear-tech/gear-integrations/tree/master/Subsquid).

The separate implementation of the NFT marketplace application example that is using indexing data via Subscquid is available in: `TBD`

