---
sidebar_label: P2P Streaming
sidebar_position: 6
---

# P2P streaming

![streaming](../img/streaming.png)

P2P streaming is an example of a decentralized application, akin to the widely popular streaming applications in the Web2 realm. Users of this application can connect and watch the live stream of one or more users. A Web2 equivalent could be the Twitch platform.

In this example of the application, a user creates a schedule for an upcoming stream broadcast at a designated time in advance. Other users can view a list of scheduled streams and subscribe to one or more. At the appointed time, the streamer commences the broadcast, and other users join it.

The application comprises three primary components:
- On-chain program: This component is responsible for storing the stream schedule and managing user subscriptions ([GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/w3bstreaming)).
- Frontend: This component serves as the application's user interface ([GitHub](https://github.com/gear-foundation/dapps/tree/master/frontend/apps/w3bstreaming))
- Signaling server: This component is responsible for establishing peer-to-peer (P2P) connections between the streamer and viewers ([GitHub](https://github.com/gear-foundation/dapps/tree/master/backend/w3bstreaming)).

This article details the program interface, data structure, fundamental functions, and their intended purposes. It can be used as is or customized to suit individual scenarios.

Also, anyone can test the application using this link: [P2P Streaming](https://w3bstreaming.vara.network) (VARA tokens are requred for gas fees).

## How to run

1. ⚒️ **Build a program**: For detailed instructions on this step, please refer to the [README](https://github.com/gear-foundation/dapps/blob/master/contracts/w3bstreaming/README.md) directory within the program's codebase.

2. 🏗️ **Upload the program** to the [Vara Network Testnet](https://idea.gear-tech.io/programs?node=wss%3A%2F%2Ftestnet.vara.network): For further guidance on program uploading, please visit the [Getting Started](../../getting-started-in-5-minutes#deploy-your-smart-contract-to-the-testnet) section.

3. 🔀 **Build and run the backend service**: For more information on this step, please consult the [README](https://github.com/gear-foundation/dapps/blob/master/backend/w3bstreaming/README.md) file within the codebase of the backend service.

4. 🖥️ **Build and run user interface**: For more information on this step, please consult the [README](https://github.com/gear-foundation/dapps/blob/master/frontend/apps/w3bstreaming/README.md) directory within the frontend codebase.

## Implementation details