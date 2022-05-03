/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from 'abell';

export default defineConfig({
  plugins: [],
  build: {
    assetsInlineLimit: 0
  }
});
