---
sidebar_label: 去中心化 DNS
sidebar_position: 24
---

# 去中心化 DNS

去中心化互联网（DNS）展示了一种链上无服务器的网站和网络应用程序托管方法。与建立在中心化组件和服务上的基于服务器的 DNS 不同，运行在区块链上的去中心化解决方案，提升了数据安全性，加强了数据调节，最大限度地减少了系统的弱点，优化了资源分配，并表现出极大的容错性。它为去中心化带来了诸多好处，如抗审查、安全弹性、高透明度。

简而言之，本解决方案包含一个上传到链上的 DNS 程序。它列出了同样上传到链上的程序（智能合约），并在 DNS 合约中注册为 DNS 记录。托管的程序有用户界面，界面可能在 IPFS 上。DNS 程序存储了程序 ID 和其接口的元信息（名称、描述和链接）。

智能合约源码和前端代码在 [GitHub](https://github.com/gear-dapps/DeIn) 上。

## 将 dApp 连接到去中心化互联网上

1. 为了将程序连接到 Gear 网络上的去中心化互联网，有必要在程序中设置一个 `Option<DnsMeta>` 类型的变量，该变量将包含 DNS 记录的元数据：

```rust
pub struct DnsMeta {
    pub name: String,
    pub link: String,
    pub description: String,
}
```

2. 还需要做的一件事是包括以下枚举变量：

    1. 在 `handle_input` 类型中：
        - `GetDnsMeta` - 它必须是枚举的第一个变量
        - `SetDnsMeta(DnsMeta)` - 它需要设置 dns 记录

    2. 在 `handle_output` 类型：
        - `DnsMeta(Option<DnsMeta>)` - 它也必须是枚举的第一个变量

3. 在程序被上传到链上之后，你需要将前端构建为单个 html 文件，并将其上传到 IPFS：
    1. 下载并安装 IPFS 桌面版 - https://github.com/ipfs/ipfs-desktop
    2. 使用 'Files' 选项，上传构建好的 web 应用程序
    3. 通过按文件上的选项按钮，获得文件链接，并选择 'Share link'。

4. 下一步是使用 `SetDnsMeta` 枚举变量向程序发送元数据。在这里需要设置名称、链接（即 IPFS 上的 html 文件的链接）和描述。

5. 要在 DNS 中注册 dApp，你需要向 DNS 程序发送一个消息。你可以通过 https://idea.gear-tech.io/ - 找到 DNS 程序，并发送带有程序 ID 的 `Register` 消息。

## 打开并使用 dApp

首先，你需要从 Release 处下载 `dns.html` 文件，并在浏览器中打开它。如果在 DNS 程序中注册了你的 dApp，你会在可用的 dApp 列表中看到它。只需点击 "Open"按钮，界面就会在新的标签中打开。

## 获取 DNS 记录

使用 https://idea.gear-tech.io ，你可以读取 DNS 程序的状态以获得记录 -- 获取全部信息或按名称、ID、模式进行过滤。
