---
sidebar_label: 常见错误
sidebar_position: 7
---

# 常见错误

这里介绍了常见的错误和解决方案。

## `LOCK` 文件不可用

- **错误：** `IO 错误：While lock file /root/.local/share/gear/chains/gear_staging_testnet_v7/db/full/LOCK: Resource temporarily unavailable`

- **解决方式：**  你似乎在运行几个 Gear 节点实例。注意，只允许运行一个节点实例。你很可能把节点配置为一个服务，然后从命令行运行第二个实例。你应该停止该服务，或者不要从命令行运行 Gear 节点。

你可以通过运行命令查看当前的节点进程：

```shell
ps aux | grep gear
```

如果你想停止所有的节点进程，可以运行：

```shell
pkill -sigint gear
```

注意，SystemD 服务不能通过上述命令停止。改为运行：

```shell
sudo systemctl stop gear-node
```

## 启动节点服务时出现意外参数

- **错误：** `Found argument '\' which wasn't expected, or isn't valid in this context`

- **解决方式：** `gear-node.service` 配置文件似乎有错误。某些版本的 SystemD 不接受反斜线字符 (`\`) 作为分行符。因此，最好将每个配置项写在一行。

    请参考 https://wiki.gear-tech.io/docs/node/node-as-service，将节点正确配置为服务。

    不要忘记在修复服务配置后重新启动节点：

    ```shell
    sudo systemctl daemon-reload
    sudo systemctl restart gear-node
    ```

## 损坏的数据库

- **错误：** `Database version cannot be read from existing db_version file`

- **替代错误：** `Invalid argument: Column families not opened: ..., col2, col1, col0`

- **解决方式：** 这个问题的根源是磁盘空间不足。你可以用以下命令检查可用空间。

    ```shell
    df -h
    ```

    此外，你可以检查区块链数据库使用了多少空间。

    ```shell
    du -h $HOME/.local/share/gear/chains/gear_staging_testnet_v7/db/full
    ```

    请参考 [系统要求](/docs/node/setting-up#system-requirements)，查看所需的最小磁盘空间。

    你需要释放更多的空间，然后裁剪链：

    ```shell
    sudo systemctl stop gear-node
    # Provide more free space on the disk
    gear purge-chain
    sudo systemctl start gear-node
    ```

## 节点可执行文件过期

- **错误：** `Verification failed for block <block-id> received from peer <peer-id>`

- **替代错误：** `runtime requires function imports which are not present on the host`

- **解决方式：** [更新](/docs/node/node-as-service#update-the-node-with-the-new-version)   node 到最新版本。

## 服务被锁定

- **错误：** `Failed to start gear-node.service: Unit gear-node.service is masked.`

- **解决方式：** 请检查此链接：https://askubuntu.com/questions/1017311/what-is-a-masked-service
