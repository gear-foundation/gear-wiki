---
sidebar_label: 'Node FAQ'
sidebar_position: 6
---

# Node FAQ

### Can I run the Gear node now?
Yes, follow the instructions from this article on how to set up and run Gear node under MacOS, Linux and Windows: https://wiki.gear-tech.io/node/setting-up

### What are hardware requirements for Gear node?	
There are no special hardware requirements except SSD for running Gear node connected to a test net or in a dev net mode. For nodes in a production network, the hardware requirements will be provided further.

### Are there rewards for running nodes?
Running a node in a production network will be incentivized. There are no regular rewards for running nodes in a test net, but participation in community events is also incentivized. Stay tuned.

### Could we run collator/validator now?	
Not at the moment. Stay tuned.

### If my node is shown in the telemetry, and syncing blocks, is that all OK?	
Yes.

### What do we have to do after running a node?
That's all at the moment, but stay tuned for future updates.

### How do I make the node work in the background?	
The solution is to configure the Gear node as a service: https://wiki.gear-tech.io/node/node-as-service 

### I have the error: `IO error: While lock file <path>: Resource temporarily unavailable`
You seem to be running several Gear node instances. You likely have configured the node as a service and then ran the second instance from the command line. You should either stop the service or don't run the Gear node from the command line.

### My host provider claims the node abuses their network.
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

### I've configured the node as a service. How can I update it?	
You just need to replace the node executable (`gear-node`) with the latest version and restart the execution. For example, if your Linux executable is located at `/root/gear-node` you are to run:
```bash
wget https://builds.gear.rs/gear-nightly-linux-x86_64.tar.xz
sudo tar -xvf gear-nightly-linux-x86_64.tar.xz -C /root
rm gear-nightly-linux-x86_64.tar.xz
sudo systemctl restart gear-node
```

### My node stopped to increment the block height after some block number.
Update the node binary to the latest version.

### How do I change the port number if the default one is already used by another software?
Use on of the supported flags when running the node:
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

### I have the error `Verification failed for block <block-id> received from peer <peer-id>`
Update the node binary to the latest version.

### How to see Gear node service logs? 
```bash 
sudo journalctl -n 100 -f -u gear-node
```

### I have an error "runtime requires function imports which are not present on the host"
Update the node binary to the latest version.

### What is the node syncing time?
The full node syncing time may be calculated using the info from the log:
`syncing_time (secs) = (target_block - finalized_block) / bps`
For example:
```bash 
Log record -> `Syncing 143.1 bps, target=#3313788 ... finalized #3223552`
syncing_time = (3313788 - 3223552) / 143.1 = 630 secs (10.5 mins)
``` 

### Is the node visible in telemetry during syncing?
Yes, it is visible on the telemetry portal - https://telemetry.gear-tech.io. It will be gray until the block height becomes up to date.

### I have the error "error: Found argument '\' which wasn't expected, or isn't valid in this context" when starting the node service
The `gear-node.service` configuration file seems to be misconfigured. Refer to https://wiki.gear-tech.io/node/node-as-service for properly configuring the node as a service.

### Should I associate my wallet with the node?
No, not at the moment.

### Is there any command to check for new updates for the node?
There is no such command. 

### What does this mean? `Failed to start gear-node.service: Unit gear-node.service is masked.`
Please check - https://askubuntu.com/questions/1017311/what-is-a-masked-service 