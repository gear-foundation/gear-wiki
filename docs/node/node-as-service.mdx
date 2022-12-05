---
sidebar_label: Node as a Service
sidebar_position: 2
---

# Сonfiguring a node as a Linux service

## Prerequisites

You need to download or compile the `gear` executable file for your OS. [See more](/docs/node/setting-up#install-with-pre-build-binary)

## Configuration

Copy the `gear` executable to the `/usr/bin` directory:

```bash
sudo cp gear /usr/bin
```

To run the Gear node as one of the Linux services, you need to configure the systemd file:

```bash
cd /etc/systemd/system
sudo nano gear-node.service
```

Configure and save:

```toml
[Unit]
Description=Gear Node
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/
ExecStart=/usr/bin/gear --name "NODE_NAME" --telemetry-url "ws://telemetry-backend-shard.gear-tech.io:32001/submit 0"
Restart=always
RestartSec=3
LimitNOFILE=10000

[Install]
WantedBy=multi-user.target
```

:::note
Declaration `ExecStart` points to the location of the `gear` binary file. In this case, it is in `/usr/bin` directory.
With -- additional launch parameters are indicated, but not mandatory.
:::

That’s it. We can now start the service.

## Starting the node

Run to start the service:

```sh
sudo systemctl start gear-node
```

Automatically get it to start on boot:

```sh
sudo systemctl enable gear-node
```

How to check status of gear-node service?

```sh
sudo systemctl status gear-node
```

## Checking logs

You may see the service logs by running the following command:

```sh
journalctl -u gear-node
```

Use navigation keys to browse the logs and <kbd>q</kbd> key to exit.

You may see the last 50 lines of logs by adding `-n 50` parameter:

```sh
journalctl -u gear-node -n 50
```

Add `-f` parameter to see the last lines of logs in continuous mode (press Ctrl+C to exit):

```sh
journalctl -u gear-node -fn 50
```

## Update the node with the new version

After the node has been running for a while, you may need to update it to the latest version.

You just need to replace the node executable (`gear`) with the latest version and restart the execution. For example, if your Linux executable is located at `/usr/bin/gear` (as we've configured above) you are to run:

```
wget https://get.gear.rs/gear-nightly-linux-x86_64.tar.xz
sudo tar -xvf gear-nightly-linux-x86_64.tar.xz -C /usr/bin
rm gear-nightly-linux-x86_64.tar.xz
sudo systemctl restart gear-node
```

## Remove the node

If you no longer need to run the node, you can completely purge it from the disk.

:::warning

Note that once you delete the node, you will not be able to fully restore it. Refer to the [Backup and Restore](/docs/node/backup-restore) article to know about the important data to be backed up.

:::

You are to remove the node's storage, the service configuration, and the executable itself:

```
sudo systemctl stop gear-node
sudo systemctl disable gear-node
sudo rm -rf /root/.local/share/gear
sudo rm /etc/systemd/system/gear-node.service
sudo rm /usr/bin/gear
```
