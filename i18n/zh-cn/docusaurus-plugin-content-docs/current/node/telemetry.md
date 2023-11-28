---
sidebar_label: '节点监控'
sidebar_position: 3
---

# 配置 Gear 节点监测

需要监控每个 Gear 节点和整个网络的健康状况，以确保真正的去中心化和稳健的运营。这包括各种块生成指标以及在 PoS 网络中至关重要的节点正常运行时间。

与任何其他基于 Substrate 的节点一样，Gear 节点可以通过 `--telemetry-url` 连接到任意的监测后端。

要开始向任意的监测服务器实例发送监测消息，需要在节点运行期间指定一个额外的选项，该选项将启用向指定的 http 地址发送监测消息。

如果你愿意参与并分享你的监测数据，那么请使用一下选项来运行你的节点：

```sh
gear --telemetry-url "wss://telemetry.rs/submit 0"
```

同时使用以下选项来提供你的节点名称：

```sh
gear --name "NODE NAME"
```

如何启动节点监测？`cd` 到你的节点二进制文件所在的目录，然后运行一下命令：

```sh
./gear --telemetry-url "wss://telemetry.rs/submit 0" --name "My_Gear_node_name"
```

要检查当前运行节点的监测信息，请访问 [https://telemetry.rs](https://telemetry.rs)。
