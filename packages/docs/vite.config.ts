import { AbellViteConfig, defineConfig } from 'abell';
import vitePluginMdToHTML from 'vite-plugin-md-to-html';
import mdx from '@mdx-js/rollup';
import { vitePluginMdxToHTML } from 'vite-plugin-mdx-to-html';
import { abellHighlighter } from './utils/abell-syntax-highlighter';

export default defineConfig({
  plugins: [
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
