import fs from 'fs';
import path from 'path';
import { vitePluginAbell } from './vite-plugin-abell';
import {
  defineConfig as viteDefineConfig,
  UserConfig as ViteUserConfig,
  UserConfigExport as ViteUserConfigExport
} from 'vite';

export type AbellOptions = {
  indexPath?: string;
};

interface AbellViteConfig extends ViteUserConfig {
  abell?: AbellOptions;
}

export const defineConfig = (config: AbellViteConfig): ViteUserConfigExport => {
  const userPlugins = config.plugins || [];

  return viteDefineConfig({
    ...config,
    plugins: [vitePluginAbell(config.abell), ...userPlugins]
  });
};

export const getConfigPath = (cwd: string): string => {
  const possibleConfigFiles = [
    'vite.config.ts',
    'vite.config.js',
    'abell.config.ts',
    'abell.config.js'
  ].map((configFileName) => path.join(cwd, configFileName));
  for (const configFile of possibleConfigFiles) {
    if (fs.existsSync(configFile)) {
      return configFile;
    }
  }

  return path.resolve(__dirname, '../defaults/vite.config');
};
