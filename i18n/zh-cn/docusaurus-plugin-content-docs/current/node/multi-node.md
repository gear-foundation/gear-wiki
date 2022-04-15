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

```sh
cargo run --
  --base-path /tmp/alice
  --chain=local
  --alice
  --node-key 0000000000000000000000000000000000000000000000000000000000000001
  --telemetry-url 'ws://telemetry-backend-shard.gear-tech.io:32001/submit 0'
  --name 'alice'
  --validator
```

2. 在另一个终端，使用下面的命令，在不同的 TCP 端口（30334）上启动 Bob 的节点，链数据库位置 `/tmp/bob`。`--bootnodes`选项将使 Bob 的节点与 Alice 的节点在 TCP 30333 端口连接。

```sh
cargo run --
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