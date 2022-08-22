---
sidebar_label: 备份和恢复
sidebar_position: 4
---

# 备份和恢复节点数据

## 数据格式

Gear 将节点数据存储在专用目录中。

- Linux：`$HOME/.local/share/gear-node`
- macOS：`$HOME/Library/Application Support/gear-node`
- Windows：`%USERPROFILE%\AppData\Local\gear-node.exe`

例如，在 Linux 操作系统中以 root 用户运行节点 (`$HOME` = `/root`)，节点数据目录的绝对路径为：

    /root/.local/share/gear-node

让我们研究下节点存储在这个目录中的数据。

    └── gear-node
        └── chains
            ├── dev
            │   └── ...
            └── staging_testnet_v2
                ├── db
                │   └── full
                ├── keystore
                └── network

### 链

节点可以连接到不同的链。可以使用 `--chain` 参数来选择链。目前默认的链是 staging test 网络。它的数据位于 `gear-node/chains/staging_testnet_v2`目录中。

如果使用`--dev`参数启动节点，开发模式下的虚拟网络将节点数据存储在`gear-node/chains/dev`。

### 数据库

数据库将区块链状态保存在本地节点存储中。它通过 p2p 协议与其他节点同步。可以使用 `--database` 参数选择不同的数据库类型。可选项是：

- `rocksdb` (默认)：使用 RocksDB 作为数据库引擎，数据存储在  `<chain>/db/full` 子目录中。
- `paritydb`：使用 ParityDB 作为数据库引擎，数据存储在 `<chain>/paritydb/full` 子目录中。
- `paritydb-experimental`：已弃用的 ParityDB 引擎实验模式 (将在未来的版本中删除)，数据存储在`<chain>/paritydb/full` 子目录中。

注意，数据库内容取决于节点的修剪模式。默认情况下，节点只保留最后 256 个块。要保留所有的块，在运行节点时，请使用 `--pruning=archive`参数。

可以在任何时候删除和同步数据库。使用`gear-node purge-chain`命令将完全删除数据库。

### 网络密钥

网络私钥用于计算唯一的节点标识符 (以`12D3KooW`开头)。这个密钥存储在 `<chain>/network/secret_ed25519` 文件中。密钥文件是一个二进制文件，包含了 32 字节 Ed25519 私钥 (默认) 。你可以使用`hexdump`命令读取密钥：

```shell
hexdump -e '1/1 "%02x"' /root/.local/share/gear-node/chains/staging_testnet_v2/network/secret_ed25519

# 42bb2fdd46edfa4f41a5f0f9c1a5a1d407a39bafbce6f07456a2c8d9963c8f5c
```

你可以通过运行带有`--node-key`参数的节点来覆盖这个密钥：

```shell
gear-node --node-key=42bb2fdd46edfa4f41a5f0f9c1a5a1d407a39bafbce6f07456a2c8d9963c8f5c

# Discovered new external address for our node: /ip4/127.0.0.1/tcp/30333/ws/p2p/12D3KooWMRApe2S5QMdhHwmcDapDxZ7xf2Xa3z2HfCCYoHTmjiXV
```

如果没有`--node-key`参数，节点使用`secret_ed25519`文件中的密钥。如果该文件不存在，则用新生成的密钥创建。

网络密钥文件一旦丢失就无法恢复。因此，你要保留它（或私钥本身），以便有可能以相同的 peer ID 运行节点。

## 迁移节点

要把节点迁移到一个新的服务器上，你要备份然后恢复以下内容（提供的路径是默认节点的参数）：

- 节点的网络密钥：

    - Linux: `$HOME/.local/share/gear-node/chains/staging_testnet_v2/network/secret_ed25519`
    - macOS: `$HOME/Library/Application Support/gear-node/chains/staging_testnet_v2/network/secret_ed25519`
    - Windows: `%USERPROFILE%\AppData\Local\gear-node.exe\chains\staging_testnet_v2\network\secret_ed25519`

- (可选) 数据库：

    - Linux: `$HOME/.local/share/gear-node/chains/staging_testnet_v2/db/full`
    - macOS: `$HOME/Library/Application Support/gear-node/chains/staging_testnet_v2/db/full`
    - Windows: `%USERPROFILE%\AppData\Local\gear-node.exe\chains\staging_testnet_v2\db\full`

- (可选) 如果你已经将节点配置为服务，则服务配置：

    - Linux: `/etc/systemd/system/gear-node.service`

如果你不备份数据库，可以选择从头开始同步它，但这个同步过程需要花一些时间。

:::info

在备份数据库之前，不要忘记停止节点。否则，你可能会得到一个损坏的数据库。

```shell
sudo systemctl stop gear-node
```

:::
