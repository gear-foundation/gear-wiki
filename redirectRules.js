const urlList = [
    {
        "to": "/docs/gear/glossary",
        "from": "/gear/glossary"
    },
    {
        "to": "/docs/",
        "from": "/gear/introduction"
    },
    {
        "to": "/docs/gear/technology/state",
        "from": "/gear/gear-state/state"
    },
    {
        "to": "/docs/gear/technology/state-transition",
        "from": "/gear/gear-state/state-transition"
    },
    {
        "to": "/docs/gear/technology/actor-model",
        "from": "/gear/actor-model"
    },
    {
        "to": "/docs/gear/technology/persist-memory",
        "from": "/gear/memory-parallelism"
    },
    {
        "to": "/docs/gear/technology/WASM",
        "from": "/gear/WASM"
    },
    {
        "to": "/docs/gear/glossary",
        "from": "/ecosystem/polkadot"
    },
    {
        "to": "/docs/gear/technology/substrate",
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
        "to": "/docs/developing-contracts/introduction",
        "from": "/developing-contracts/gear-program"
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
        "to": "/docs/examples/Standards/gft-20",
        "from": "/examples/gft-20"
    },
    {
        "to": "/docs/examples/Standards/gnft-721",
        "from": "/examples/gnft-721"
    },
    {
        "to": "/docs/examples/Standards/gnft-4907",
        "from": "/examples/gnft-4907"
    },
    {
        "to": "/docs/examples/Standards/gmt-1155",
        "from": "/examples/gmt-1155"
    },
    {
        "to": "/docs/examples/Governance/DAO",
        "from": "/examples/DAO"
    },
    {
        "to": "/docs/examples/DeFi/escrow",
        "from": "/examples/escrow"
    },
    {
        "to": "/docs/examples/Gaming/game-of-chance",
        "from": "/examples/lottery"
    },
    {
        "to": "/docs/examples/DeFi/dutch-auction",
        "from": "/examples/dutch-auction"
    },
    {
        "to": "/docs/examples/Infra/supply-chain",
        "from": "/examples/supply-chain"
    },
    {
        "to": "/docs/examples/DeFi/multisig-wallet",
        "from": "/examples/multisig-wallet"
    },
    {
        "to": "/docs/examples/NFTs/concert",
        "from": "/examples/concert"
    },
    {
        "to": "/docs/examples/NFTs/nft-marketplace/marketplace",
        "from": "/examples/marketplace"
    },
    {
        "to": "/docs/examples/Standards/rmrk",
        "from": "/examples/rmrk"
    },
    {
        "to": "/docs/examples/NFTs/onchain-nft",
        "from": "/examples/onchain-nft"
    },
    {
        "to": "/docs/examples/DeFi/staking",
        "from": "/examples/staking"
    },
    {
        "to": "/docs/examples/DeFi/crowdsale",
        "from": "/examples/crowdsale-ico"
    },
    {
        "to": "/docs/examples/Gaming/rock-paper-scissors",
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
        "to": "/docs/general/DeFi",
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
        "to": "/docs/examples/Standards/gft-20",
        "from": "/examples/erc20"
    },
    {
        "to": "/docs/examples/Standards/gft-20",
        "from": "/docs/examples/erc20"
    },
    {
        "to": "/docs/examples/ping",
        "from": "/ping"
    },
    {
        "to": "/docs/examples/Standards/gft-20",
        "from": "/gft-20"
    },
    {
        "to": "/docs/examples/Standards/gnft-721",
        "from": "/gnft-721"
    },
    {
        "to": "/docs/examples/NFTs/dynamic-nft",
        "from": "/dynamic-nft"
    },
    {
        "to": "/docs/examples/Standards/gnft-4907",
        "from": "/gnft-4907"
    },
    {
        "to": "/docs/examples/Standards/gmt-1155",
        "from": "/gmt-1155"
    },
    {
        "to": "/docs/examples/Governance/DAO",
        "from": "/DAO"
    },
    {
        "to": "/docs/examples/DeFi/escrow",
        "from": "/escrow"
    },
    {
        "to": "/docs/examples/Gaming/game-of-chance",
        "from": "/game-of-chance"
    },
    {
        "to": "/docs/examples/DeFi/dutch-auction",
        "from": "/dutch-auction"
    },
    {
        "to": "/docs/examples/Infra/supply-chain",
        "from": "/supply-chain"
    },
    {
        "to": "/docs/examples/DeFi/multisig-wallet",
        "from": "/multisig-wallet"
    },
    {
        "to": "/docs/examples/NFTs/concert",
        "from": "/concert"
    },
    {
        "to": "/docs/examples/Standards/rmrk",
        "from": "/rmrk"
    },
    {
        "to": "/docs/examples/NFTs/onchain-nft",
        "from": "/onchain-nft"
    },
    {
        "to": "/docs/examples/DeFi/staking",
        "from": "/staking"
    },
    {
        "to": "/docs/examples/DeFi/crowdsale",
        "from": "/crowdsale"
    },
    {
        "to": "/docs/examples/Gaming/rock-paper-scissors",
        "from": "/rock-paper-scissors"
    },
    {
        "to": "/docs/examples/DeFi/dex",
        "from": "/dex"
    },
    {
        "to": "/docs/examples/NFTs/nft-pixelboard",
        "from": "/nft-pixelboard"
    },
    {
        "to": "/docs/examples/Gaming/monopoly",
        "from": "/monopoly"
    },
    {
        "to": "/docs/examples/Infra/dein",
        "from": "/dein"
    },
    {
        "to": "/docs/examples/infa/varatube",
        "from": "/varatube"
    },
    {
        "to": "/docs/examples/Gaming/tequila-train",
        "from": "/tequila-train"
    }
]

module.exports.urlList = urlList;
