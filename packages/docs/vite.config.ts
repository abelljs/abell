import { AbellViteConfig, defineConfig } from 'abell';
import vitePluginMdToHTML from 'vite-plugin-md-to-html';
import mdx from '@mdx-js/rollup';
import { vitePluginMdxToHTML } from 'vite-plugin-mdx-to-html';
import { abellHighlighter } from './utils/abell-syntax-highlighter';
import { isoImport } from 'vite-plugin-iso-import';
import vitePluginSitemap from 'vite-plugin-sitemap';

export default defineConfig({
  abell: {
    serverBuild: {
      // I am using top-level await in entry.build.ts
      target: 'es2022'
    }
  },
  server: {
    headers: {
      // This it to make webcontainers work in local dev server
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  plugins: [
    isoImport(),
    vitePluginMdToHTML({
      syntaxHighlighting: true,
      highlightJs: {
        register: {
          abell: abellHighlighter
        }
      }
    }),
    mdx(),
    vitePluginMdxToHTML(),
    vitePluginSitemap({
      hostname: 'https://abelljs.org/',
      exclude: ['/webcontainer'],
      readable: true,
      robots: [
        {
          allow: '/',
          disallow: '/webcontainer',
          userAgent: '*'
        }
      ]
    })
  ]
}) as AbellViteConfig;
