# Gear Wiki

[![Publish Status](https://github.com/gear-tech/wiki/workflows/Publish/badge.svg)](https://github.com/gear-tech/wiki/actions/workflows/publish.yml?query=branch%3Amaster)

Welcome to Gear network documentation portal for developers. It provides guides and documentation for everyone who wants to start developing using the Gear ecosystem. While our project is developing and growing, it is a modern knowledge base at the moment. Contributions are welcome!

🕸️ https://wiki.gear-tech.io

## Build Locally

0. Install [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com).

1. Make a local clone of Wiki repository:

    ```bash
    git clone https://github.com/gear-tech/wiki.git
    cd wiki
    ```

2. Install dependencies:

    ```bash
    yarn install
    ```

    alternatively

    ```bash
    npm install
    ```

3. Start your local Wiki copy and instantly track changes you've made. Open it in your default browser - http://localhost:3000/:

    ```bash
    yarn start
    ```

    alternatively

    ```bash
    npm run start
    ```

#### Tips
If you want to run with your locale, please use below commands

```bash
yarn start --locale <locale>
```

For example, if you want run Chinese version, please run `yarn start --locale zh-cn`.

## Contribute

If you have anything to write on the Wiki, feel free to open [an issue](https://github.com/gear-tech/wiki/issues/new) or create a [pull request](https://github.com/gear-tech/wiki/pulls).

## License

The content on the Gear Wiki website is distributed under the [CC0 1.0 Universal License](LICENSE).
