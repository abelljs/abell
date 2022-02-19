import path from 'path';
import { compile } from '../compiler';
import { AbellOptions } from './general-utils';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function vitePluginAbell(abellOptions?: AbellOptions) {
  return {
    name: 'abell',
    transform(src: string, id: string) {
      // resolve pages directory in default entry build
      if (id.endsWith('secret.default.entry.build.js')) {
        const indexPath = abellOptions?.indexPath ?? './src/index.abell';
        const userConfiguredPagesDir = path.join(
          process.cwd(),
          path.dirname(indexPath)
        );
        const abellDirPath = path.relative(__dirname, userConfiguredPagesDir);
        const entryBuildSrc = src.replaceAll(
          '{{ abellPagesDir }}',
          abellDirPath
        );
        return { code: entryBuildSrc };
      }

      // transpile abell files into js code
      if (id.endsWith('.abell')) {
        const filename = path.relative(process.cwd(), id);
        const code = compile(src, filename);
        return {
          code
        };
      }
    }
  };
}