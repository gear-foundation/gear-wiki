---
sidebar_label: Node FAQ
sidebar_position: 7
---

# Node FAQ

## Can I run the Gear node now?

Yes, follow the instructions from this article on how to set up and run Gear node under MacOS, Linux and Windows:
[Setting Up](/docs/node/setting-up)

## What are hardware requirements for Gear node?

There are no special hardware requirements except SSD for running Gear node connected to a test net or in a dev net mode. For nodes in a production network, the hardware requirements will be provided further.

Please refer to the [System Requirements](/docs/node/setting-up#system-requirements) to see the actual hardware requirements.

## I have an error when trying to run the node

Please refer to the [Troubleshooting](/docs/node/troubleshooting) section to find typical errors and solutions.

## Are there rewards for running nodes?

Validator nodes in Gear-powered networks, such as [Vara](https://vara.network/), are incentivized according to the Nominated Proof-of-Stake (NPoS) mechanism. Refer to [this article](https://wiki.vara.network/docs/staking/overview) for more details.

Additionally, anyone can run a local node for development or/and run local services.

## Could we run validator now?

Yes, anyone can setup a validator in the Vara network. Follow the instructions from the [Validators guide](https://wiki.vara.network/docs/staking/validate).

## How do I make the node work in the background?

The solution is to configure the [Gear node as a service](/docs/node/node-as-service).

## My host provider claims the node abuses their network.

This should be resolved by adding `--no-private-ipv4` argument when running the node.
 If for some reason, that argument doesn't solve the issue for you, then you can deny egress traffic to:
```bash
10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
100.64.0.0/10
169.254.0.0/16
```
For example you can use this manual: https://community.hetzner.com/tutorials/block-outgoing-traffic-to-private-networks

## I've configured the node as a service. How can I update it?

You just need to replace the node executable (`gear`) with the latest version and restart the execution. For example, if your Linux executable is located at `/usr/bin` you are to run:

```shell
curl https://get.gear.rs/gear-v1.1.1-x86_64-unknown-linux-gnu.tar.xz | sudo tar -xJC /usr/bin
sudo systemctl restart gear-node
```

## My node stopped to increment the block height after some block number.

[Update](/docs/node/node-as-service#update-the-node-with-the-new-version) the node binary to the latest version.

## How do I change the port number if the default one is already used by another software?

Use one of the supported flags when running the node:

```
--port <PORT>
    Specify p2p protocol TCP port

--prometheus-port <PORT>
    Specify Prometheus exporter TCP Port

--rpc-port <PORT>
    Specify JSON-RPC server TCP port
```

Default ports are:

- P2P: `30333`
- Prometheus: `9615`
- WebSocket/HTTP JSON-RPC: `9944`

## How to see Gear node service logs?

See the [Checking logs](/docs/node/node-as-service#checking-logs) section for details.

## What is the node syncing time?

The full node syncing time may be calculated using the info from the log:

$$
syncing\char`_time \text{ [secs]} = \frac{target\char`_block - finalized\char`_block} {bps}
$$

For example, let's calculate the syncing time from the following log record:

```
... ⚙️ Syncing 143.1 bps, target=#3313788 ... finalized #3223552 ...
```

$$
syncing\char`_time = \frac {3313788 - 3223552} {143.1} \approx 630 \text{ secs } (10.5 \text{ mins})
$$

## Is the node visible in telemetry during syncing?

Only Validator nodes are visible on the telemetry portal - https://telemetry.rs.

## Is there any command to check for new updates for the node?

There is no such command.
