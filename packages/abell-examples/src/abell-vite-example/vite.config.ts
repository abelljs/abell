import { defineConfig } from 'vite';
import { abellVitePlugin } from '../../../abell-renderer/src/vite-plugin-abell';

export default defineConfig({
  plugins: [abellVitePlugin()]
});
