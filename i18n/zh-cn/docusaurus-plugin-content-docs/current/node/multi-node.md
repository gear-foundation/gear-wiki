---
sidebar_label: '多节点模式'
sidebar_position: 5
---

# 创建一个多节点本地测试网络

对于更高级的智能合约调试和测试，更接近真实的网络环境，你可以建立本地测试网，由几个互连的节点组成。这种模式可以看到多节点共识算法的运行情况。

运行具有两个验证节点的本地测试网，分别为 Alice 和 Bob，它们拥有`local`测试网的初始权限，并被赋予测试网单元，更多细节请看[配置](https://github.com/gear-tech/gear/blob/master/node/src/chain_spec.rs)。

注意：这将需要两个终端 (每个节点一个)。

1. 首先运行 Alice 节点。下面的命令使用默认的 TCP 端口 (30333)，并指定`/tmp/alice` 作为链数据库位置。
 Alice 的节点 ID 是`12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp`（传统表示为：`QmRpheLN4JWdAnY7HGJfWFNbfkQCb6tFf4vA6hgjMZKrR`）；这由 node-key 决定。

  ```bash
  ./gear \
    --base-path /tmp/alice \
    --chain=local \
    --alice \
    --node-key 0000000000000000000000000000000000000000000000000000000000000001 \
    --telemetry-url "wss://telemetry.rs/submit 0"
  ```

Alice 节点将在 块#0 以空闲模式运行，等待第二个验证节点。

```
  Gear Node
  ✌️ version 0.1.0-6dc8d24edd9
  ❤️ by Gear Technologies, 2021-2022
  📋 Chain specification: Gear Local Testnet
  🏷 Node name: Alice
  👤 Role: AUTHORITY
  💾 Database: RocksDb at /tmp/alice/chains/gear_local_testnet/db/full
  ⛓ Native runtime: gear-610 (gear-1.tx1.au1)
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

另外，你可以在监测网站（https://telemetry.rs）的 **Gear Local Testnet** 标签下找到 `Alice` 节点名称。

2. 在另一个终端，使用下面的命令，在不同的 TCP 端口（30334）上启动 Bob 的节点，链数据库位置在 `/tmp/bob`。`--bootnodes` 选项将使 Bob 节点与 Alice 节点在 TCP `30333` 端口连接。

```bash
  ./gear \
    --base-path /tmp/bob \
    --bootnodes /ip4/127.0.0.1/tcp/30333/p2p/12D3KooWEyoppNCUx8Yx66oV9fJnriXwCcXwDDUA2kj6vnc6iDEp \
    --chain=local \
    --bob \
    --port 30334 \
    --ws-port 9945 \
    --telemetry-url "wss://telemetry.rs/submit 0"
```

运行第二个验证者节点后，网络开始产生新的区块。

```
  Gear Node
  ✌️ version 0.1.0-6dc8d24edd9
  ❤️ by Gear Technologies, 2021-2022
  📋 Chain specification: Gear Local Testnet
  🏷 Node name: Bob
  👤 Role: AUTHORITY
  💾 Database: RocksDb at /tmp/bob/chains/gear_local_testnet/db/full
  ⛓ Native runtime: gear-610 (gear-1.tx1.au1)
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

3. 网络已经启动！如果想停止网络，只需在两个运行会话中按下 <kbd>Ctrl</kbd> + <kbd>C</kbd>即可。
