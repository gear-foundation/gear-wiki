import {themes as prismThemes} from 'prism-react-renderer'
import redirects from './redirects.json'

import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

/** @type {import('@docusaurus/types').Config} */
export default {
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
      defaultMode: 'dark',
    },
    image: 'img/ogimage.jpg',
    navbar: {
      title: 'Gear Wiki',
      logo: {
        alt: 'Gear documentation portal',
        src: 'img/logo-black.svg',
        srcDark: 'img/logo-white.svg',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://www.vara.network/',
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
        /*{
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },*/
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['rust', 'toml'],
    },
    algolia: {
      appId: 'OI5YH8L74V',
      apiKey: '70e750fb6f98f28f089ca6f0c7cd86a6',
      indexName: 'gear-tech',
      contextualSearch: true,
      searchParameters: {},
      searchPagePath: 'search',
    },
    docs: {
      sidebar: {
        autoCollapseCategories: true,
      },
    },
  },
  plugins: [
    'docusaurus-plugin-sass',
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: redirects,
      },
    ],
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/gear-foundation/gear-wiki/edit/master/',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
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
          customCss: './src/css/custom.scss',
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
        label: '简体中文',
      },
    },
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
  scripts: [
    // {
    //   src: 'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.9/iframeResizer.contentWindow.min.js',
    //   defer: true,
    // },
    {
      src: 'https://cdn.jsdelivr.net/npm/@iframe-resizer/child',
      defer: true,
    },
  ],
}
