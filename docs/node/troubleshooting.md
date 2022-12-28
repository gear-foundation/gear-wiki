---
sidebar_label: Troubleshooting
sidebar_position: 8
---

# Troubleshooting

Typical errors and solutions are described here.

## Unavailable `LOCK` file

- **Error:** `IO error: While lock file /root/.local/share/gear/chains/gear_staging_testnet_v5/db/full/LOCK: Resource temporarily unavailable`

- **Solution:** You seem to be running several Gear node instances. Note that only one node instance is allowed to run. You likely have configured the node as a service and then ran the second instance from the command line. You should either stop the service or don't run the Gear node from the command line.

    You can see the current node processes by running the command:

    ```shell
    ps aux | grep gear
    ```

    If you want to break all node processes you may run:

    ```shell
    pkill -sigint gear
    ```

    Note that the SystemD service can't be stopped by the command above. Run instead:

    ```shell
    sudo systemctl stop gear-node
    ```

## Unexpected argument when starting the node service

- **Error:** `Found argument '\' which wasn't expected, or isn't valid in this context`

- **Solution:** The `gear-node.service` configuration file seems to be misconfigured. Some versions of SystemD do not accept the backslash character (`\`) as a line break. Therefore, it is better to write each of the config entry on one line.

    Refer to https://wiki.gear-tech.io/node/node-as-service for properly configuring the node as a service.

    Don't forget to restart the node after fixing the service configuration:

    ```shell
    sudo systemctl daemon-reload
    sudo systemctl restart gear-node
    ```

## Corrupted data base

- **Error:** `Database version cannot be read from existing db_version file`

- **Alternative error:** `Invalid argument: Column families not opened: ..., col2, col1, col0`

- **Solution:** The root of this problem is the lack of the disk free space. You may check the free space using the following command:

    ```shell
    df -h
    ```

    Also, you may check how many space is used by the blockchain DB:

    ```shell
    du -h $HOME/.local/share/gear/chains/gear_staging_testnet_v5/db/full
    ```

    Please refer to the [System Requirements](/docs/node/setting-up#system-requirements) to see the minimum disk space required.

    You need to free more space then purge the chain:

    ```shell
    sudo systemctl stop gear-node
    # Provide more free space on the disk
    gear purge-chain
    sudo systemctl start gear-node
    ```

## Node executable file obsolescence

- **Error:** `Verification failed for block <block-id> received from peer <peer-id>`

- **Alternative error:** `runtime requires function imports which are not present on the host`

- **Solution:** [Update](/docs/node/node-as-service#update-the-node-with-the-new-version) the node binary to the latest version.

## Masked service

- **Error:** `Failed to start gear-node.service: Unit gear-node.service is masked.`

- **Solution:** Please check: https://askubuntu.com/questions/1017311/what-is-a-masked-service
