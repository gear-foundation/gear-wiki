const urlList = [
    {
        "to": "/docs/gear/glossary",
        "from": "/gear/glossary"
    },
    {
        "to": "/docs/gear/introduction",
        "from": "/gear/introduction"
    },
    {
        "to": "/docs/gear/gear-state/state",
        "from": "/gear/gear-state/state"
    },
    {
        "to": "/docs/gear/gear-state/state-transition",
        "from": "/gear/gear-state/state-transition"
    },
    {
        "to": "/docs/gear/actor-model",
        "from": "/gear/actor-model"
    },
    {
        "to": "/docs/gear/memory-parallelism",
        "from": "/gear/memory-parallelism"
    },
    {
        "to": "/docs/gear/WASM",
        "from": "/gear/WASM"
    },
    {
        "to": "/docs/ecosystem/polkadot",
        "from": "/ecosystem/polkadot"
    },
    {
        "to": "/docs/ecosystem/substrate",
        "from": "/ecosystem/substrate"
    },
    {
        "to": "/docs/getting-started-in-5-minutes",
        "from": "/getting-started-in-5-minutes"
    },
    {
        "to": "/docs/idea/idea-overview",
        "from": "/idea/idea-overview"
    },
    {
        "to": "/docs/idea/online-ide",
        "from": "/idea/online-ide"
    },
    {
        "to": "/docs/idea/account/create-account",
        "from": "/idea/account/create-account"
    },
    {
        "to": "/docs/idea/account/ss58",
        "from": "/idea/account/ss58"
    },
    {
        "to": "/docs/node/setting-up",
        "from": "/node/setting-up"
    },
    {
        "to": "/docs/node/node-as-service",
        "from": "/node/node-as-service"
    },
    {
        "to": "/docs/node/telemetry",
        "from": "/node/telemetry"
    },
    {
        "to": "/docs/node/backup-restore",
        "from": "/node/backup-restore"
    },
    {
        "to": "/docs/node/dev-net",
        "from": "/node/dev-net"
    },
    {
        "to": "/docs/node/multi-node",
        "from": "/node/multi-node"
    },
    {
        "to": "/docs/node/node-faq",
        "from": "/node/node-faq"
    },
    {
        "to": "/docs/node/troubleshooting",
        "from": "/node/troubleshooting"
    },
    {
        "to": "/docs/developing-contracts/gear-program",
        "from": "/developing-contracts/gear-program"
    },
    {
        "to": "/docs/developing-contracts/messaging",
        "from": "/developing-contracts/messaging"
    },
    {
        "to": "/docs/developing-contracts/interactions-between-programs",
        "from": "/developing-contracts/interactions-between-programs"
    },
    {
        "to": "/docs/developing-contracts/testing",
        "from": "/developing-contracts/testing"
    },
    {
        "to": "/docs/developing-contracts/deploy",
        "from": "/developing-contracts/deploy"
    },
    {
        "to": "/docs/examples/prerequisites",
        "from": "/examples/prerequisites"
    },
    {
        "to": "/docs/examples/ping",
        "from": "/examples/ping"
    },
    {
        "to": "/docs/examples/gft-20",
        "from": "/examples/gft-20"
    },
    {
        "to": "/docs/examples/gnft-721",
        "from": "/examples/gnft-721"
    },
    {
        "to": "/docs/examples/gmt-1155",
        "from": "/examples/gmt-1155"
    },
    {
        "to": "/docs/examples/feeds",
        "from": "/examples/feeds"
    },
    {
        "to": "/docs/examples/DAO",
        "from": "/examples/DAO"
    },
    {
        "to": "/docs/examples/escrow",
        "from": "/examples/escrow"
    },
    {
        "to": "/docs/examples/lottery",
        "from": "/examples/lottery"
    },
    {
        "to": "/docs/examples/dutch-auction",
        "from": "/examples/dutch-auction"
    },
    {
        "to": "/docs/examples/supply-chain",
        "from": "/examples/supply-chain"
    },
    {
        "to": "/docs/examples/multisig-wallet",
        "from": "/examples/multisig-wallet"
    },
    {
        "to": "/docs/examples/concert",
        "from": "/examples/concert"
    },
    {
        "to": "/docs/examples/marketplace",
        "from": "/examples/marketplace"
    },
    {
        "to": "/docs/examples/rmrk",
        "from": "/examples/rmrk"
    },
    {
        "to": "/docs/examples/onchain-nft",
        "from": "/examples/onchain-nft"
    },
    {
        "to": "/docs/examples/staking",
        "from": "/examples/staking"
    },
    {
        "to": "/docs/examples/crowdsale-ico",
        "from": "/examples/crowdsale-ico"
    },
    {
        "to": "/docs/examples/rock-paper-scissors",
        "from": "/examples/rock-paper-scissors"
    },
    {
        "to": "/docs/api/getting-started",
        "from": "/api/getting-started"
    },
    {
        "to": "/docs/api/keyring",
        "from": "/api/keyring"
    },
    {
        "to": "/docs/api/calculate-gas",
        "from": "/api/calculate-gas"
    },
    {
        "to": "/docs/api/upload-program",
        "from": "/api/upload-program"
    },
    {
        "to": "/docs/api/submit-code",
        "from": "/api/submit-code"
    },
    {
        "to": "/docs/api/send-message",
        "from": "/api/send-message"
    },
    {
        "to": "/docs/api/read-state",
        "from": "/api/read-state"
    },
    {
        "to": "/docs/api/metadata-type-creation",
        "from": "/api/metadata-type-creation"
    },
    {
        "to": "/docs/api/mailbox",
        "from": "/api/mailbox"
    },
    {
        "to": "/docs/api/events",
        "from": "/api/events"
    },
    {
        "to": "/docs/api/extra-queries",
        "from": "/api/extra-queries"
    },
    {
        "to": "/docs/api/tooling/create-gear-app",
        "from": "/api/tooling/create-gear-app"
    },
    {
        "to": "/docs/api/tooling/meta-cli",
        "from": "/api/tooling/meta-cli"
    },
    {
        "to": "/docs/general/web3",
        "from": "/general/web3"
    },
    {
        "to": "/docs/general/dApps",
        "from": "/general/dApps"
    },
    {
        "to": "/docs/general/contracts",
        "from": "/general/contracts"
    },
    {
        "to": "/docs/general/defi",
        "from": "/general/defi"
    },
    {
        "to": "/docs/general/nft",
        "from": "/general/nft"
    },
    {
        "to": "/docs/general/dao",
        "from": "/general/dao"
    },
    {
        "to": "/docs/examples/gft-20",
        "from": "/developing-contracts/examples/erc20"
    },
    {
        "to": "/docs/examples/gft-20",
        "from": "/docs/developing-contracts/examples/erc20"
    }
]

module.exports.urlList = urlList;