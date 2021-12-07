---
sidebar_label: 'Setting Up'
sidebar_position: 1
---

# Setting Up the local node

Gear node can run in a single Dev Net mode or you can create a Multi-Node local testnet or make your own build of Gear node.

1. Compile and launch node as described in [Gear Node README](https://github.com/gear-tech/gear/tree/master/node#readme). Alternatively, download nightly build of Gear node:

    - **Windows x64**: [gear-nightly-windows-x86_64.zip](https://builds.gear.rs/gear-nightly-windows-x86_64.zip)
    - **macOS M1**: [gear-nightly-macos-m1.tar.gz](https://builds.gear.rs/gear-nightly-macos-m1.tar.gz)
    - **macOS Intel x64**: [gear-nightly-macos-x86_64.tar.gz](https://builds.gear.rs/gear-nightly-macos-x86_64.tar.gz)
    - **Linux x64**: [gear-nightly-linux-x86_64.tar.xz](https://builds.gear.rs/gear-nightly-linux-x86_64.tar.xz)

2. Run Gear node without special arguments to get a node connected to the testnet:

    ```bash
    gear-node
    ```

3. Get more info about usage details, flags, avilable options and subcommands:

    ```bash
    gear-node --help
    ```

***

Refer to the [Gear Node README](https://github.com/gear-tech/gear/tree/master/node) for details and some examples.