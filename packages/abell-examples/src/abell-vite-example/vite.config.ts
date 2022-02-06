import { defineConfig } from 'vite';
import { vitePluginAbell } from '../../../abell/src/vite-plugin-abell';

export default defineConfig({
  plugins: [vitePluginAbell()]
});
