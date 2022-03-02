---
sidebar_label: 'Node Monitoring'
sidebar_position: 2
---

# Sending Gear node telemetry

The health of each Gear node and the entire network needs to be monitored to ensure truly decentralized and robust operations. This includes the various block production metrics as well as node uptime which is vital in PoS networks.

As any other Substrate based nodes, Gear node can be connected to an arbitrary telemetry backend using the `--telemetry-url`.

To start sending telemetry messages to the arbitrary telemetry server instance, one needs to specify an additional key during node run that will enable sending telemetry to specified http address. 

If you want to participate and share your telemetry - run your node with flag:

```sh
--telemetry-url 'ws://telemetry-backend-shard.gear-tech.io:32001/submit 0'
```

Also provide your node name using: 

```sh
--name 'NODE NAME'
```

Example to start a node with telemetry - `cd` to the directory where your node binary resides and run the command: 

```sh
./gear-node --telemetry-url 'ws://telemetry-backend-shard.gear-tech.io:32001/submit 0' --name 'My_Gear_node_name' 
```

To check telemetry for currently running nodes, visit web address - [https://telemetry.gear-tech.io](https://telemetry.gear-tech.io).
