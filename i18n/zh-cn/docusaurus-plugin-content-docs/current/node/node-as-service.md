---
sidebar_label: 将节点程序配置成服务
sidebar_position: 2
---

# 将节点程序配置成 Linux 服务

## 前期准备

你需要依据自己的操作系统下载或者自行编译 `gear-node` 可执行文件。[更多信息](https://wiki.gear-tech.io/node/setting-up#install-with-pre-build-binary)。

## 配置服务

为了将 Gear 节点程序作为 Linux 的服务，你需要参照以下方式来配置 `systemd` 文件：

从 `root` 目录开始：

```sh
cd /etc/systemd/system
sudo nano gear-node.service
```

配置并保存：

```
[Unit]
Description=Gear Node
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/
ExecStart=/usr/bin/gear --name "NODE_NAME" --telemetry-url "wss://telemetry.rs/submit 0"
Restart=always
RestartSec=3
LimitNOFILE=10000

[Install]
WantedBy=multi-user.target
```

:::note
`ExecStart` 指向 `gear` 二进制文件所在的位置。在示例中是在 `/usr/bin` 目录。
使用 `--` 引入额外的启动参数，但这些参数并不是必须的。
:::

## 运行节点

到这里我们就可以使用以下命令来启动服务：

```sh
sudo systemctl start gear-node
```

使其能够随系统自动启动：

```sh
sudo systemctl enable gear-node
```

检查 `gear-node` 服务状态：

```sh
sudo systemctl status gear-node
```

## 检查日志

运行以下命令可以查看服务日志：

```sh
journalctl -u gear-node
```

使用导航键浏览日志，使用`q`键退出。

你可以通过添加参数`-n 50`来查看最后 50 行日志：

```sh
journalctl -u gear-node -n 50
```

添加`-f`参数，在连续模式下查看日志的最后一行 (按 Ctrl+C 退出)：

```sh
journalctl -u gear-node -fn 50
```

## 更新节点版本

你只需要把节点的可执行文件（`gear`）替换成最新版本，然后重新启动执行。
例如，如果你的 Linux 可执行文件位于/usr/bin（如我们上面的配置），你要运行：

```
curl https://get.gear.rs/gear-v1.0.2-x86_64-unknown-linux-gnu.tar.xz | sudo tar -xJC /usr/bin
sudo systemctl restart gear-node
```

## 删除节点

运行以下命令，删除节点的存储、服务配置和可执行文件：

```
sudo systemctl stop gear-node
sudo systemctl disable gear-node
sudo rm -rf /root/.local/share/gear
sudo rm /etc/systemd/system/gear-node.service
sudo rm /usr/bin/gear
```
