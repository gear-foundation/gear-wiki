---
sidebar_label: 'IDEA 简介'
sidebar_position: 1
---

# Gear IDEA online

Gear IDEA 是一个方便的工具，其目的是让用户熟悉 Gear 平台。它为智能合约开发者提供了最简单、最快捷的方式来编写、编译、测试并直接通过浏览器将智能合约上传到测试网络，而无需额外的配置。

这是一个演示应用程序，实现了在 Gear 中与智能合约互动的所有可能性，同时管理账户、账户余额、事件和其他信息。

你现在就可以在 [https://idea.gear-tech.io/](https://idea.gear-tech.io/) ，开始进行实验。

# IDEA 组件和微服务

[frontend](https://github.com/gear-tech/gear-js/tree/master/website/frontend)

基于 React 的前端应用，用来为 Gear IDEA 提供合约交互能力。

[events-listener](https://github.com/gear-tech/gear-js/tree/master/website/events-listener)

监听 Gear 节点上的所有事件的微服务，将事件发送到存储服务(data-storage)。

[data-storage](https://github.com/gear-tech/gear-js/tree/master/website/data-storage)

存储上传的程序元数据和相关事件的微服务。

[api-gateway](https://github.com/gear-tech/gear-js/tree/master/website/api-gateway)

为外部用户提供同事件、元数据进行交互的微服务。

[test-balance](https://github.com/gear-tech/gear-js/tree/master/website/test-balance)

用来获取测试代币的微服务

[wasm-compiler](https://github.com/gear-tech/gear-js/tree/master/website/wasm-compiler)

用来将 Rust 项目编译成 WASM 的微服务。