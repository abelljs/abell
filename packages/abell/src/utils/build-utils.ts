import path from 'path';
import { getAbsolutePath } from './abell-fs';

type ProgramInfo = {
  abellConfig: AbellConfig;
  task: 'build' | 'serve';
  logs: 'minimum' | 'full';
  port: number;
};
export function getProgramInfo(): ProgramInfo {
  // Get configured paths of destination and content
  const abellConfig = getAbellConfig();

  const programInfo: ProgramInfo = {
    abellConfig,
    task: 'build',
    logs: 'minimum',
    port: 5000
  };

  return programInfo;
}

export type AbellConfig = {
  outputPath: string;
  themePath: string;
  contentPath: string;
  plugins: string[];
  globalMeta: Record<string, unknown>;
};

/**
 * Read Abell Configration
 */
function getAbellConfig() {
  const defaultConfigs: AbellConfig = {
    outputPath: 'dist',
    themePath: 'theme',
    contentPath: 'content',
    plugins: [],
    globalMeta: {}
  };

  // In dev-server, user may change the configs so in that case we should drop the old cache
  delete require.cache[path.join(process.cwd(), 'abell.config.js')];

  let requiredConfig: Partial<AbellConfig>;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    requiredConfig = require(path.join(process.cwd(), 'abell.config.js'));
  } catch (e) {
    requiredConfig = {};
  }

  const abellConfig: AbellConfig = {
    ...defaultConfigs,
    ...requiredConfig
  };

  const outputPath = getAbsolutePath(abellConfig.outputPath);
  const themePath = getAbsolutePath(abellConfig.themePath);
  const contentPath = getAbsolutePath(abellConfig.contentPath);

  return {
    ...abellConfig,
    outputPath,
    themePath,
    contentPath
  };
}
