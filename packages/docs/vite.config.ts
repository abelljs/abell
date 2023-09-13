import { AbellViteConfig, defineConfig } from 'abell';
import vitePluginMdToHTML from 'vite-plugin-md-to-html';
import mdx from '@mdx-js/rollup';
import { vitePluginMdxToHTML } from 'vite-plugin-mdx-to-html';
import { abellHighlighter } from './utils/abell-syntax-highlighter';
import { isoImport } from 'vite-plugin-iso-import';

export default defineConfig({
  abell: {
    serverBuild: {
      // I am using top-level await in entry.build.ts
      target: 'es2022'
    }
  },
  server: {
    headers: {
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
    vitePluginMdxToHTML()
  ]
}) as AbellViteConfig;
