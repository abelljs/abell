import { defineConfig } from 'vite';
import { vitePluginAbell } from '../../../abell-renderer/src/vite-plugin-abell';

export default defineConfig({
  plugins: [vitePluginAbell()]
});
