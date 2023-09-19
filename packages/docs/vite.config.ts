import { AbellViteConfig, defineConfig } from 'abell';
import mdx from '@mdx-js/rollup';
import { vitePluginJSXToHTML } from 'vite-plugin-jsx-to-html';
import { isoImport } from 'vite-plugin-iso-import';
import vitePluginSitemap from 'vite-plugin-sitemap';
import rehypeSlug from 'rehype-slug';

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
    mdx({
      rehypePlugins: [rehypeSlug]
    }),
    vitePluginJSXToHTML({ extensions: ['.mdx'] }),
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
