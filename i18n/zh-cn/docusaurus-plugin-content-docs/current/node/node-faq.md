---
sidebar_label: '常见问题'
sidebar_position: 6
---

# 节点常见问题

### 现在可以运行节点吗？
当然可以，这篇文章中就如何在 MacOS、Linux 和 Windows 系统中设置和运行 Gear 节点进行了说明，你可以根据指示操作。https://wiki.gear-tech.io/zh-cn/node/setting-up

### Gear 节点对硬件有什么要求？
除了连接到测试网或在开发网模式下运行 Gear 节点的 SSD，没有特殊的硬件要求。对于生产网络中的节点，将会有额外的硬件要求。

### 运行节点有奖励吗？
在生产网络中运行一个节点将得到相应奖励。在测试网中运行节点没有常规奖励，但参与社区活动会得到部分奖励。请继续关注最新资讯。

### 现在可以运行 collator/validator 吗？
目前不能。请继续关注最新资讯。

### 如果节点在节点监控器中显示并同步区块，一切运行正常吗？
是的，节点运行正常。

### 运行节点后需要做什么？
目前只需运行节点，请关注后续更新。

### 如何使节点在后台工作？
解决方案是将 Gear 节点配置为一个服务：https://wiki.gear-tech.io/zh-cn/node/node-as-service/

### `IO error: While lock file <path>: Resource temporarily unavailable` 遇到以上问题该如何解决？
你似乎正在运行几个 Gear 节点实例。你很可能把节点配置为一个服务，然后从命令行运行了第二个实例。你应该停止配置服务或者停止从命令行运行 Gear 节点。

### 所使用的云主机供应商称该节点滥用他们的网络。
你可以在运行节点时添加`--no-private-ipv4`参数来解决这一问题。
如果由于某些原因，该参数不能解决你的问题，那么你可以禁止出站流量：
```bash
10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
100.64.0.0/10
169.254.0.0/16
```
例如，你可以使用这个手册进行操作：https://community.hetzner.com/tutorials/block-outgoing-traffic-to-private-networks

### 将节点配置为服务后应该怎样更新节点？
你只需要把节点的可执行文件（`gear`）替换成最新版本，然后重新执行。例如，如果你的 Linux 可执行文件位于`/usr/bin`，你将运行：
```bash
wget https://get.gear.rs/gear-nightly-linux-x86_64.tar.xz
sudo tar -xvf gear-nightly-linux-x86_64.tar.xz -C /usr/bin
rm gear-nightly-linux-x86_64.tar.xz
sudo systemctl restart gear-node
```

### 节点在某个区块编号后停止增加区块高度。
你需要将节点的二进制文件更新到最新版本。

### 如果默认的端口号已经被其他软件使用，如何改变端口号？
请在运行节点时使用其支持的 flag。
```bash
--port <PORT>
    Specify p2p protocol TCP port

--prometheus-port <PORT>
    Specify Prometheus exporter TCP Port

--rpc-port <PORT>
    Specify HTTP RPC server TCP port

--ws-port <PORT>
    Specify WebSockets RPC server TCP port
```

### `Verification failed for block <block-id> received from peer <peer-id>` 遇到以上问题该如何解决？
请将节点二进制文件更新到最新版本。

### 如何查看 Gear 节点服务日志？
```bash
sudo journalctl -n 100 -f -u gear-node
```

### "runtime requires function imports which are not present on the host" 遇到以上问题该如何解决？
请将节点二进制文件更新到最新版本。

#### 节点的同步时间是多少？
完整的节点同步时间可以用日志中的信息来计算：
`syncing_time (secs) = (target_block - finalized_block) / bps`
例如：
```bash
Log record -> `Syncing 143.1 bps, target=#3313788 ... finalized #3223552`
syncing_time = (3313788 - 3223552) / 143.1 = 630 secs (10.5 mins)
```

### 节点同步时，是否可以在节点监控器中观察到该节点？
是的，你可以在节点监控器中看到该节点 —— https://telemetry.gear-tech.io。在区块高度完成更新前，该节点呈灰色。

### 在启动节点服务时，遇到了该问题 "error: Found argument '\' which wasn't expected, or isn't valid in this context" 请问如何解决？
`gear-node.service`配置文件似乎配置不当。请参考 - https://wiki.gear-tech.io/zh-cn/node/node-as-service/，将节点正确配置为一个服务。

### 需要将钱包连接节点吗？
目前无需进行该操作。

### 是否有任何命令用以检查节点的最新更新？
没有这样的命令。

### `Failed to start gear-node.service: Unit gear-node.service is masked.` 遇到以上问题该如何解决？
请查看 —— https://askubuntu.com/questions/1017311/what-is-a-masked-service
