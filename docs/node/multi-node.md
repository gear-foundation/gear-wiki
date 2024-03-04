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
  gear \
    --base-path /tmp/alice \
    --chain=local \
    --alice \
    --node-key 0000000000000000000000000000000000000000000000000000000000000001 \
    --telemetry-url "wss://telemetry.rs/submit 0"
  ```

  The Alice node will be run in idle mode at block #0 waiting for the second validator node.

  ```
  Gear Node
  ✌️ version 1.1.1-d02d306f97c
  ❤️ by Gear Technologies, 2021-2024
  📋 Chain specification: Vara Local Testnet
  🏷 Node name: Alice
  👤 Role: AUTHORITY
  💾 Database: RocksDb at /tmp/alice/chains/gear_local_testnet/db/full
  ⛓ Native runtime: vara-1020 (vara-1.tx1.au1)
  👶 Creating empty BABE epoch changes on what appears to be first startup.
  Using default protocol ID "sup" because none is configured in the chain specs
  🏷 Local node identity is: 12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp
  💻 Operating system: macos
  💻 CPU architecture: aarch64
  📦 Highest known block at #0
  〽️ Prometheus exporter started at 127.0.0.1:9615
  Running JSON-RPC HTTP server: addr=127.0.0.1:9933, allowed origins=Some(["http://localhost:*", "http://127.0.0.1:*", "https://localhost:*", "https://127.0.0.1:*", "https://polkadot.js.org"])
  Running JSON-RPC WS server: addr=127.0.0.1:9944, allowed origins=Some(["http://localhost:*", "http://127.0.0.1:*", "https://localhost:*", "https://127.0.0.1:*", "https://polkadot.js.org"])
  🏁 CPU score: 1020MB/s
  🏁 Memory score: 37732MB/s
  🏁 Disk score (seq. writes): 1496MB/s
  🏁 Disk score (rand. writes): 421MB/s
  👶 Starting BABE Authorship worker
  💤 Idle (0 peers), best: #0 (0x22c7…6847), finalized #0 (0x22c7…6847), ⬇ 0 ⬆ 0
  💤 Idle (0 peers), best: #0 (0x22c7…6847), finalized #0 (0x22c7…6847), ⬇ 0 ⬆ 0
  💤 Idle (0 peers), best: #0 (0x22c7…6847), finalized #0 (0x22c7…6847), ⬇ 0 ⬆ 0
  💤 Idle (0 peers), best: #0 (0x22c7…6847), finalized #0 (0x22c7…6847), ⬇ 0 ⬆ 0
  ```

  Also, you can find the `Alice` node name on the telemetry site (https://telemetry.rs) under the **Gear Local Testnet** tab.

2. In another terminal, use the following command to start Bob's node on a different TCP port (`30334`) and with a chain database location of `/tmp/bob`. The `--bootnodes` option will connect this node to the Alice's one on TCP port `30333`:

  ```bash
  gear \
    --base-path /tmp/bob \
    --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp \
    --chain=local \
    --bob \
    --port 30334 \
    --ws-port 9945 \
    --telemetry-url "wss://telemetry.rs/submit 0"
  ```

  After running the second validator the network starts to produce new blocks.

  ```
  Gear Node
  ✌️ version 1.1.1-33ee05d5aab
  ❤️ by Gear Technologies, 2021-2024
  📋 Chain specification: Vara Local Testnet
  🏷 Node name: Bob
  👤 Role: AUTHORITY
  💾 Database: RocksDb at /tmp/bob/chains/gear_local_testnet/db/full
  ⛓ Native runtime: vara-1110 (vara-1.tx1.au1)
  🔨 Initializing Genesis block/state (state: 0xf470…d2dc, header-hash: 0x22c7…6847)
  👴 Loading GRANDPA authority set from genesis on what appears to be first startup.
  👶 Creating empty BABE epoch changes on what appears to be first startup.
  Using default protocol ID "sup" because none is configured in the chain specs
  🏷 Local node identity is: 12D3KooWHpsf9Gp59ct6t6d1MmKHxbmZRvSWcUej7cUNmWNBdvZE
  💻 Operating system: macos
  💻 CPU architecture: aarch64
  📦 Highest known block at #0
  Running JSON-RPC HTTP server: addr=127.0.0.1:61429, allowed origins=Some(["http://localhost:*", "http://127.0.0.1:*", "https://localhost:*", "https://127.0.0.1:*", "https://polkadot.js.org"])
  Running JSON-RPC WS server: addr=127.0.0.1:9945, allowed origins=Some(["http://localhost:*", "http://127.0.0.1:*", "https://localhost:*", "https://127.0.0.1:*", "https://polkadot.js.org"])
  🏁 CPU score: 875MB/s
  🏁 Memory score: 38353MB/s
  🏁 Disk score (seq. writes): 1497MB/s
  🏁 Disk score (rand. writes): 421MB/s
  👶 Starting BABE Authorship worker
  discovered: 12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp /ip4/192.168.1.4/tcp/30333
  discovered: 12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp /ip6/::1/tcp/30333
  discovered: 12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp /ip4/127.0.0.1/tcp/30333
  🙌 Starting consensus session on top of parent 0x22c70bb6baf611e5c9a6b1886b307dfa25cf1972b3400e70eb15d624c8b96847
  🎁 Prepared block for proposing at 1 (0 ms) [hash: 0x1f55c4a9daf8c35d4388313ad67deec4ff5e472659e2fec310bd3032bcbdfe71; parent_hash: 0x22c7…6847; extrinsics (2): [0x8bbd…2a85, 0x7d5c…0b86]]
  🔖 Pre-sealed block for proposal at 1. Hash now 0xe46f6031bb73710e239665d0da4212fbdcca77d57f9504d357c078f3b315389e, previously 0x1f55c4a9daf8c35d4388313ad67deec4ff5e472659e2fec310bd3032bcbdfe71.
  👶 New epoch 0 launching at block 0xe46f…389e (block slot 1667197557 >= start slot 1667197557).
  👶 Next epoch starts at slot 1667198157
  ✨ Imported #1 (0xe46f…389e)
  🙌 Starting consensus session on top of parent 0xe46f6031bb73710e239665d0da4212fbdcca77d57f9504d357c078f3b315389e
  🎁 Prepared block for proposing at 2 (0 ms) [hash: 0x66281c25f34157c713876cda6f39324a0da6a9a50c0c32310683bca875c1ab4c; parent_hash: 0xe46f…389e; extrinsics (2): [0xcb81…f7c3, 0x7d5c…0b86]]
  🔖 Pre-sealed block for proposal at 2. Hash now 0x2ab179fe98969cab0970df085b86e03dbee33daed527f6595bcdbeffebc64175, previously 0x66281c25f34157c713876cda6f39324a0da6a9a50c0c32310683bca875c1ab4c.
  ✨ Imported #2 (0x2ab1…4175)
  🙌 Starting consensus session on top of parent 0x2ab179fe98969cab0970df085b86e03dbee33daed527f6595bcdbeffebc64175
  🎁 Prepared block for proposing at 3 (0 ms) [hash: 0xb5b9be01adb191671e0421f4673f8bee0751481aaac7ea453d806161e3b46dd7; parent_hash: 0x2ab1…4175; extrinsics (2): [0x7771…de48, 0x7d5c…0b86]]
  🔖 Pre-sealed block for proposal at 3. Hash now 0xf2ed128d41d96da623281745555a0fe00a033630aacf57ac02acc31ced267db0, previously 0xb5b9be01adb191671e0421f4673f8bee0751481aaac7ea453d806161e3b46dd7.
  ✨ Imported #3 (0xf2ed…7db0)
  ```

3. The network is live! If you want to stop it, just press <kbd>Ctrl</kbd> + <kbd>C</kbd> in both running sessions.
