const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Gear Network documentation portal',
  tagline: 'Dinosaurs are cool',
  url: 'https://gear-tech.io/docs',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: '/img/favicon-32x32.png',
  organizationName: 'Gear Tecnical',
  projectName: 'docs',
  themeConfig: {
    navbar: {
      title: 'use std::gear_docs',
      logo: {
        alt: 'Gear documentation portal',
        src: 'img/logo-black.svg',
        srcDark: "img/logo-white.svg"
      },
      items: [
        {
          href: 'https://github.com/gear-tech/docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: './docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/gear-tech/docs/edit/master/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
