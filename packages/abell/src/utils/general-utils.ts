import fs from 'fs';
import path from 'path';
import { vitePluginAbell } from './vite-plugin-abell';
import {
  defineConfig as viteDefineConfig,
  UserConfig,
  UserConfigExport
} from 'vite';

export const defineConfig = (config: UserConfig): UserConfigExport => {
  const userPlugins = config.plugins || [];
  return viteDefineConfig({
    ...config,
    plugins: [vitePluginAbell(), ...userPlugins]
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
