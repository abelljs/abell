import path from 'path';
import { compile } from './compiler';
import { AbellOptions } from '../utils/internal-utils';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function vitePluginAbell(abellOptions?: AbellOptions) {
  return {
    name: 'abell',
    transform(src: string, id: string) {
      // This is hack for dynamic global imports. We can't do dynamic global imports in current codebase
      // resolve pages directory in default entry build
      if (id.endsWith('secret.default.entry.build.js')) {
        const indexPath = abellOptions?.indexPath ?? './index.abell';
        const userConfiguredPagesDir = path.join(
          process.cwd(),
          path.dirname(indexPath)
        );
        const abellDirPath = path.relative(
          path.dirname(id),
          userConfiguredPagesDir
        );
        const entryBuildSrc = src.replaceAll(
          '{{ abellPagesDir }}',
          abellDirPath
        );
        return { code: entryBuildSrc };
      }

      // transpile abell files into js code
      if (id.endsWith('.abell')) {
        const code = compile(src, {
          filepath: id,
          cwd: process.cwd()
        });
        return {
          code
        };
      }
    }
  };
}
