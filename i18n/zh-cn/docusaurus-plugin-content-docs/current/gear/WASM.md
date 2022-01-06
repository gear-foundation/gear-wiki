---
sidebar_label: 'WASM'
sidebar_position: 5
---

# WebAssembly

由于技术的特殊性，WebAssembly VM(或 WASM)被证明比任何替代方案都要快。WebAssembly 的使用让 GEAR 的智能合约直接编译成机器代码，并以本机速度运行。更高的速度意味着更低的交易成本和更高的效率。

Gear 在底层使用 WebAssembly。任何 Gear 程序都是 WebAssembly 格式的。在 Gear 背景下，任何智能合约都是指 WebAssembly 程序。

WebAssembly 具有以下优点：

- 媲美原生速度: 因为它将程序代码转换为实际的硬件指令。
- 可移植性: 它可以在任何硬件上运行。
- 安全: 经过正确验证的 WebAssembly 程序不能穿透沙箱(由规范保证)。

WebAssembly 是一项全球性的工业技术，引人注目的原因有很多：

- 它的设计和实施是在该领域所有主要竞争对手的合作下进行的。
- 它的设计和发布伴随着一个完整的数学和机器验证的形式。
