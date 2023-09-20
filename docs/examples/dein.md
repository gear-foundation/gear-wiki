---
sidebar_label: Decentralized DNS
sidebar_position: 24
---

# Decentralized DNS

Decentralized Internet (DNS) demonstrates an on-chain server-less approach to web sites and web applications hosting. Unlike server-based DNS built on centralized components and services, decentralized solutions running on the blockchain are characterized by boosted data security, enhanced data reconciliation, minimized system weak points, optimized resource allocation, and demonstrated great fault tolerance. It brings all the benefits of decentralization such as censorship resistance, security resilience, high transparency.

Briefly the solution consists of a DNS program that is uploaded on-chain. It lists programs (smart-contracts) that are also uploaded on-chain and registered in DNS contract as DNS records. Hosted programs may have the user interface that resides on IPFS. The DNS program stores program ids and meta info of their interfaces (name, description and link).

The source code of the smart contract and frontend implementation is available on [GitHub](https://github.com/gear-foundation/dapps/tree/master/contracts/ddns).
Note that its repository contains a git submodule, so cloning should be done with the `--recurse-submodules` flag, i.e.:
```
git clone --recurse-submodules "https://github.com/gear-foundation/dapps"
```

## Connect your dApp to the Decentralized Internet

1. To connect your program to the Decentralized Internet on Gear Network it's necessary to have a variable of type `Option<DnsMeta>` in your program that will contain metadata of the DNS record:

```rust
pub struct DnsMeta {
    pub name: String,
    pub link: String,
    pub description: String,
}
```

2. One more thing that you need to do is to include the following enum variants:

    1. In `handle_input` type:
        - `GetDnsMeta` - it has to be the first variant of the enum
        - `SetDnsMeta(DnsMeta)` - it is needed to setup the dns record

    2. In `handle_output` type:
        - `DnsMeta(Option<DnsMeta>)` - it also has to be the first variant of the enum

3. After your program has been uploaded on chain you need to build your frontend to a single html file and upload it to IPFS:
    1. Download and install IPFS Desktop - https://github.com/ipfs/ipfs-desktop
    2. Upload your built web app using 'Files' tab
    3. Get file link by pressing option dots button on file and choose 'Share link'

4. The next step is to send Metadata to your program using the `SetDnsMeta` enum variant. Where you need to set name, link (that is link to html file on IPFS) and description.

5. To register your dApp in DNS, you need to send a message to the DNS program. You can do it through https://idea.gear-tech.io/ - find the DNS program and send the message `Register` with the id of your program.

## Open and use dApp

Firstly you need to download the `dns.html` file from Releases and open it in your browser. If you have your dApp registered in the DNS program you will see it in the list of available dApps. Just click the "Open" button and your interface will be opened in the new tab.

## Get DNS records

Using https://idea.gear-tech.io, you can read the state of the DNS program to get records - all or filtered by name, id, pattern.
