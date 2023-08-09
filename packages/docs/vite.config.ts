import path from 'path';
import { AbellViteConfig, defineConfig } from 'abell';
import vitePluginMdToHTML from 'vite-plugin-md-to-html';
import mdx from '@mdx-js/rollup';
import { vitePluginMdxToHTML } from 'vite-plugin-mdx-to-html';
import { abellHighlighter } from './utils/abell-syntax-highlighter';
import { isoImport } from 'vite-plugin-iso-import';
import viteSvgToWebfont from 'vite-svg-2-webfont';

export default defineConfig({
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
    viteSvgToWebfont({
      context: path.resolve('assets/icons'),
      dest: path.resolve('assets')
    })
  ]
}) as AbellViteConfig;
