---
sidebar_position: 0
sidebar_label: '简介'
---

# 介绍

Gear 在引擎盖下使用 Substrate 框架。它提供了企业级去中心化项目最需要的要求--高容错、可复制、标记化、不变性、数据安全和生产级别的的跨平台持久性数据库。

Substrate 是一个模块化框架，可以在共识机制、核心功能和安全性方面定制区块链，开箱即用。

Substrate 是 Polkadot 网络的一个重要组成部分。它允许每个创建新区块链的团队不用浪费精力从头开始实现网络层和共识层的代码。
更多细节请参考[Substrate 文档](https://substrate.dev/docs/en/)。

Polkadot 是下一代区块链协议，旨在联合多个专用区块链，允许它们大规模无缝操作。Polkadot 网络的关键方面是它能够在链之间传递任何消息。这些消息使两个 parachains 之间的协商通道，并允许通过它发送异步消息。

使用 Substrate 可以将 Gear 实例作为一个 parachain/parathread 快速连接到 Polkadot/Kusama 网络中。

Polkadot Relay Chain 和 Gear 使用相同的语言（异步消息）。异步消息架构使 Gear 成为 Polkadot 网络的一个有效的、易于使用的 parachain：

- 用户将程序部署到 Gear 网络
- 为流行的 parachains 或 bridges 建立了单独的渠道（可能有很多且相互竞争）。
- 整个 Gear parachain 通过他们进行通信。
- 这样的架构可以驱动网络在不同状态下的转换，并很好地适应整个网络。
