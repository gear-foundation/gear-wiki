---
sidebar_label: Dev Net Mode
sidebar_position: 5
---

# Running Gear node in Dev Net mode

Dev net is helpful for the development and debugging of your smart contracts. You can upload your program directly to a local node, send messages to a program and validate the program's logic.

To run the Gear node in a dev net mode:

1. Compile or download nightly build for your operating system as described in [setting-up](/docs/node/setting-up).

2. Run the node in dev mode (we assume the executable is in `/usr/bin` directory):

```bash
gear --dev
```

3. Follow https://idea.gear-tech.io/ and connect to a local dev node. Click network selection via the left top button, choose Development -> Local node, and click the Switch button. Use the Idea portal for sending messages, reading the program's state, etc.

4. To purge any existing dev chain state, use:

```bash
gear purge-chain --dev
```

5. To start a dev chain with detailed logging, use:

```bash
RUST_LOG=debug RUST_BACKTRACE=1 gear -lruntime=debug --dev
```
