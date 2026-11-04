// @ts-check
// Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

import {themes as prismThemes} from 'prism-react-renderer';
import fs from 'fs';
import path from 'path';
import os from 'os';

function collectDocRedirects() {
  /** @type {{from: string, to: string}[]} */
  const redirects = [];

  /** @param {string} content */
  function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    const yaml = match[1];
    const slugMatch = yaml.match(/^slug:\s*(\S+)/m);
    const redirectSection = yaml.match(/^redirect_from:\n((?:[ \t]+-[ \t]+\S+\n?)+)/m);
    const slug = slugMatch?.[1];
    const froms = redirectSection
      ? redirectSection[1].split('\n').map(/** @param {string} l */ l => l.match(/\S+$/)?.[0]).filter(/** @returns {x is string} @param {string|undefined} x */ x => !!x)
      : [];
    return { slug, froms };
  }

  /**
   * @param {string} dir
   * @param {string} prefix
   */
  function scan(dir, prefix) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath, prefix);
      } else if (/\.mdx?$/.test(entry.name) && !entry.name.startsWith('_')) {
        const { slug, froms } = parseFrontmatter(fs.readFileSync(fullPath, 'utf8'));
        if (slug && froms.length) {
          const to = `${prefix}${slug}`;
          for (const from of froms) redirects.push({ from, to });
        }
      }
    }
  }

  scan(path.join(process.cwd(), 'docs'), '/docs');
  const pagesDir = path.join(process.cwd(), 'src/pages');
  if (fs.existsSync(pagesDir)) scan(pagesDir, '');

  const caseSensitiveFS = os.platform() !== 'darwin' && os.platform() !== 'win32';
  return redirects
    .filter(r => caseSensitiveFS || r.from.toLowerCase() !== r.to.toLowerCase())
    .filter((r, i, arr) => caseSensitiveFS || arr.findIndex(x => x.from.toLowerCase() === r.from.toLowerCase()) === i);
}

const docRedirects = collectDocRedirects();

const caseSensitiveFS = os.platform() !== 'darwin' && os.platform() !== 'win32';
/** @type {{from: string, to: string}[]} */
const faqRedirects = [
  { from: '/faq', to: '/frequently-asked-questions' },
  { from: '/FAQ', to: '/frequently-asked-questions' },
  { from: '/Frequently-Asked-Questions', to: '/frequently-asked-questions' },
].filter(r => caseSensitiveFS || r.from.toLowerCase() !== r.to.toLowerCase())
 .filter((r, i, arr) => caseSensitiveFS || arr.findIndex(x => x.from.toLowerCase() === r.from.toLowerCase()) === i);

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'SapMachine',
  tagline: 'An OpenJDK distribution maintained by SAP',
  favicon: 'img/favicon.ico',

  clientModules: [
    require.resolve('./src/clientModules/scrollToHash.js'),
  ],

  future: {
    v4: true,
    faster: false,
  },

  url: process.env.SITE_URL ?? 'https://sapmachine.io',
  baseUrl: process.env.BASE_URL ?? '/',

  organizationName: 'SAP',
  projectName: 'SapMachine',

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      { redirects: [...docRedirects, ...faqRedirects] },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
};

export default config;