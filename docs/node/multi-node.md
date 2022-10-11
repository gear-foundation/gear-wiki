---
sidebar_label: Multi-Node Mode
sidebar_position: 6
---

# Creating a Multi-Node local testnet

For more advanced smart contracts debugging and testing closer to the real network environment, you can build your local testnet that consists of several interconnected nodes. This mode allows to see the multi-node consensus algorithm in action.

Run a local testnet with two validator nodes, Alice and Bob, that have been [configured](https://github.com/gear-tech/gear/blob/master/node/src/chain_spec.rs) as the initial authorities of the `local` testnet chain and endowed with testnet units.

Note: this will require two terminal sessions (one for each node).

1. Start Alice's node first. The command below uses the default TCP port (30333) and specifies `/tmp/alice` as the chain database location. Alice's node ID will be `12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp` (legacy representation: `QmRpheLN4JWdAnY7HGJfWFNbfkQCb6tFf4vvA6hgjMZKrR`); this is determined by the node-key.

```bash
./gear
  --base-path /tmp/alice
  --chain=local
  --alice
  --node-key 0000000000000000000000000000000000000000000000000000000000000001
  --telemetry-url 'ws://telemetry-backend-shard.gear-tech.io:32001/submit 0'
  --name 'alice'
  --validator
```

2. In another terminal, use the following command to start Bob's node on a different TCP port (30334) and with a chain database location of `/tmp/bob`. The `--bootnodes` option will connect his node to Alice's on TCP port 30333:

```bash
./gear
  --base-path /tmp/bob
  --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp
  --chain=local
  --bob
  --port 30334
  --ws-port 9945
  --telemetry-url 'ws://telemetry-backend-shard.gear-tech.io:32001/submit 0'
  --name 'bob'
  --validator
```
