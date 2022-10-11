---
sidebar_label: Dev Net Mode
sidebar_position: 5
---

# Running Gear node in Dev Net mode

Dev net is useful for development and debugging of your smart contracts. You can upload your program directly to a local node, send messages to a program and validate the program's logic.

To run a Gear node in a dev net mode:

1. Compile or download nightly build for your operating system as described in [setting-up](/docs/node/setting-up).

2. Run the node in dev mode:
```bash
./gear --dev --tmp
```

3. Follow to https://idea.gear-tech.io/ and connect to a local dev node. Click network selection via the left top button, choose Development -> Local node and click Switch button. Use Idea portal for sending messages, reading program's state etc.

4. To purge any existing dev chain state, use:
```bash
./gear purge-chain --dev
```

5. To start a dev chain with detailed logging, use:
```bash
RUST_LOG=debug RUST_BACKTRACE=1 ./gear -lruntime=debug --dev
```
