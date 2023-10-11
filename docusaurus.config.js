const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;
const { urlList } = require('./redirectRules');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = async function config() {
  const math = (await import('remark-math')).default;
  const katex = (await import('rehype-katex')).default;

  return {
    title: 'Gear Documentation Portal',
    tagline: 'The place to start developing with Gear',
    url: 'https://wiki.gear-tech.io/',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: '/img/favicon-32x32.png',
    organizationName: 'Gear Technologies',
    projectName: 'docs',
    themeConfig: {
      announcementBar: {
        id: 'Varathon',
        content:
          'Ready to build on the edge of Web3? Join Vara online hackathon - <a target="_blank" href="https://varathon.io/?utm_source=wiki&utm_medium=banner&utm_campaign=banner"> Gear up</a>',
        isCloseable: false,
      },
      colorMode: {
        defaultMode: 'dark'
      },
      image: 'img/ogimage.jpg',
      navbar: {
        title: 'Gear Wiki',
        logo: {
          alt: 'Gear documentation portal',
          src: 'img/logo-black.svg',
          srcDark: "img/logo-white.svg"
        },
        items: [
          {
            to: 'docs/',
            activeBasePath: 'docs',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://www.vara-network.io/',
            label: 'Vara Network',
            position: 'right',
          },
          {
            href: 'https://www.gear-tech.io/',
            label: 'Gear-tech.io',
            position: 'right',
          },
          {
            href: 'https://github.com/gear-foundation/gear-wiki',
            label: 'Contribute',
            position: 'right',
          },
          {
            type: 'docsVersionDropdown',
            position: 'right',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['rust', 'toml'],
      },
      algolia: {
        appId: "OI5YH8L74V",
        apiKey: "70e750fb6f98f28f089ca6f0c7cd86a6",
        indexName: "gear-tech",
        contextualSearch: true,
        searchParameters: {},
        searchPagePath: 'search',
      }
    },
    plugins: [
      'docusaurus-plugin-sass',
      [
        '@docusaurus/plugin-client-redirects',
        {
          redirects: urlList
        }
      ],
    ],
    presets: [
      [
        '@docusaurus/preset-classic',
        {
          docs: {
            sidebarPath: require.resolve('./sidebars.js'),
            editUrl:
              'https://github.com/gear-foundation/gear-wiki/edit/master/',
            remarkPlugins: [math],
            rehypePlugins: [katex],
            lastVersion: 'current',
            versions: {
              current: {
                label: 'Stable',
                badge: false,
              },
              next: {
                path: 'next',
                label: 'Unstable 🚧',
                banner: 'unreleased',
                badge: true,
              },
            },
          },
          blog: false,
          theme: {
            customCss: require.resolve('./src/css/custom.scss'),
          },
          googleAnalytics: {
            trackingID: 'UA-213824102-2',
            anonymizeIP: true,
          },
          googleTagManager: {
            containerId: 'GTM-54QDWGN',
          },
        },
      ],
    ],
    i18n: {
      defaultLocale: 'en',
      locales: ['en', 'zh-cn'],
      localeConfigs: {
        'en': {
          label: 'English',
        },
        'zh-cn': {
          label: '简体中文'
        }
      }
    },
    stylesheets: [
      {
        href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
        type: 'text/css',
        integrity:
          'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
        crossorigin: 'anonymous',
      },
    ],
  }
};
