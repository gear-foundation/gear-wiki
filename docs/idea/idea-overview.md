---
sidebar_label: IDEA Overview
sidebar_position: 1
---

# Gear IDEA online

Gear IDEA is a convenient tool that’s purpose is to familiarize users with the Gear platform. It provides smart-contract developers with the easiest and fastest way to write, compile, test and upload smart-contracts to a test network directly in their browser without additional configuration.

This is the demo application that implements all of the possibilities of interaction with smart-contracts in Gear, which also manages accounts, balances, events and more.

You can start experimenting right now at https://idea.gear-tech.io/.

# IDEA components and microservices

[frontend](https://github.com/gear-tech/gear-js/tree/main/idea/frontend)

React application that provides the user interface for working with smart-contracts on Gear IDEA.

[indexer](https://github.com/gear-tech/gear-js/tree/master/idea/indexer)

Microservice is responsible for blockchain indexing and storing information about programs and their messages as well as for storing programs metadata.

[test-balance](https://github.com/gear-tech/gear-js/tree/main/idea/test-balance)

Microservice provides the opportunity to obtain test tokens.

[api-gateway](https://github.com/gear-tech/gear-js/tree/main/idea/api-gateway)

Microservice provides any interaction between `indexer` / `test-balance` services and an external user
