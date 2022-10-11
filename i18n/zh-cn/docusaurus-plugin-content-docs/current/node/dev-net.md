---
sidebar_label: '开发网络'
sidebar_position: 4
---

# 运行一个 Gear 开发节点

开发节点对于开发和调试智能合约非常有用。你可以直接上传程序到本地节点，向程序发送消息，并验证程序的逻辑。

使用开发模式运行 Gear 节点：

1. 按照 https://wiki.gear-tech.io/zh-cn/node/setting-up/ 中的描述，为你的操作系统编译或下载最新构建版本。

2. 使用开发模式运行节点：

```bash
./gear --dev --tmp
```

3. 访问 https://idea.gear-tech.io/ 并连接到本地开发节点。通过左上方的按钮点击网络切换，选择 Development -> Local node，然后点击切换按钮。使用 Idea 发送消息，读取程序状态等。

4. 要清除开发链的节点数据，请使用：

```bash
./gear purge-chain --dev
```

5. 要运行一个有详细日志的开发链，请使用：

```bash
RUST_LOG=debug RUST_BACKTRACE=1 ./gear -lruntime=debug --dev
```
