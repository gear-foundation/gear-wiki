---
sidebar_label: '配置节点'
sidebar_position: 1
---

# 配置本地节点

Gear 节点可以有单节点的开发网络模式，你也可以选择创建多节点的本次测试网和编译自己的 Gear 节点。

1. 参照 [Gear 节点说明](https://github.com/gear-tech/gear/tree/master/node#readme) 来编译和运行节点。或者直接下载 Gear 节点的每日构建版：

    - **Windows x64**: [gear-nightly-windows-x86_64.zip](https://builds.gear.rs/gear-nightly-windows-x86_64.zip)
    - **macOS M1**: [gear-nightly-macos-m1.tar.gz](https://builds.gear.rs/gear-nightly-macos-m1.tar.gz)
    - **macOS Intel x64**: [gear-nightly-macos-x86_64.tar.gz](https://builds.gear.rs/gear-nightly-macos-x86_64.tar.gz)
    - **Linux x64**: [gear-nightly-linux-x86_64.tar.xz](https://builds.gear.rs/gear-nightly-linux-x86_64.tar.xz)


2. 不使用特殊参数运行 Gear 节点，以连接到测试网：

   ```bash
   gear-node
   ```

3. 获取更多关于 Gear 使用细节、可用选项和子命令的信息：

    ```bash
    gear-node --help
    ```

***

更多详情和一些范例请参考 [Gear 节点介绍](https://github.com/gear-tech/gear/tree/master/node)。
