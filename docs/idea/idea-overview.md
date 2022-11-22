---
sidebar_label: IDEA Overview
sidebar_position: 1
---

# Gear IDEA online

Gear IDEA is a convenient tool that’s purpose is to familiarize users with the Gear platform. It provides smart-contract developers with the easiest and fastest way to write, compile, test and upload smart-contracts to a test network directly in their browser without additional configuration.

This is the demo application that implements all of the possibilities of interaction with smart-contracts in Gear, that also manages accounts, balances, events and more.

You can start experimenting right now on https://idea.gear-tech.io/.

# IDEA components and microservices

[frontend](https://github.com/gear-tech/gear-js/tree/main/idea/frontend)

React application that provides user interface for working with smart-contracts on Gear IDEA.

[events-listener](https://github.com/gear-tech/gear-js/tree/main/idea/events-listener)

Microservice listens to all the events occuring in the Gear node and sends to the data-storage to store the information about them.

[data-storage](https://github.com/gear-tech/gear-js/tree/main/idea/data-storage)

Microservice responsible for storing metadata of uploaded programs and information about events.

[api-gateway](https://github.com/gear-tech/gear-js/tree/main/idea/api-gateway)

Microservice provides any interaction between the events / meta data store and an external user.

[test-balance](https://github.com/gear-tech/gear-js/tree/main/idea/test-balance)

Microservice provides the opportunity to obtain test tokens.

[wasm-compiler](https://github.com/gear-tech/gear-js/tree/main/idea/wasm-compiler)

Microservice provides the opportunity to compile Rust projects to Wasm.
