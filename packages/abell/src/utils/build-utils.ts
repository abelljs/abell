import path from 'path';

export type ProgramInfo = {
  abellConfig: AbellConfig;
  task: 'build' | 'serve';
  logs: 'minimum' | 'full';
  port: number;
  baseWorkingDir: string;
};

/**
 * All the information needed to build the abell project
 */
export function getProgramInfo(baseWorkingDir: string): ProgramInfo {
  // Get configured paths of destination and content
  const abellConfig = getAbellConfig(baseWorkingDir);

  const programInfo: ProgramInfo = {
    abellConfig,
    task: 'build',
    logs: 'minimum',
    port: 5000,
    baseWorkingDir
  };

  return programInfo;
}

export type AbellConfig = {
  outputPath: string;
  sourcePath: string;
  contentPath: string;
  plugins: string[];
  globalMeta: Record<string, unknown>;
};

/**
 * Read Abell Configration
 */
function getAbellConfig(baseWorkingDir: string): AbellConfig {
  const defaultConfigs: AbellConfig = {
    outputPath: 'dist',
    sourcePath: 'src',
    contentPath: 'content',
    plugins: [],
    globalMeta: {}
  };

  // In dev-server, user may change the configs so in that case we should drop the old cache
  delete require.cache[path.join(baseWorkingDir, 'abell.config.js')];

  let requiredConfig: Partial<AbellConfig>;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    requiredConfig = require(path.join(baseWorkingDir, 'abell.config.js'));
  } catch (e) {
    requiredConfig = {};
  }

  const abellConfig: AbellConfig = {
    ...defaultConfigs,
    ...requiredConfig
  };

  const outputPath = path.join(baseWorkingDir, abellConfig.outputPath);
  const sourcePath = path.join(baseWorkingDir, abellConfig.sourcePath);
  const contentPath = path.join(baseWorkingDir, abellConfig.contentPath);

  return {
    ...abellConfig,
    outputPath,
    sourcePath,
    contentPath
  };
}
