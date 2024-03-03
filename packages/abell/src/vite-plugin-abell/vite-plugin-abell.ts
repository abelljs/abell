import path from 'path';
import { PluginOption, transformWithEsbuild } from 'vite';
import { compile } from './compiler/index.js';
import { AbellOptions } from '../type-utils.js';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function vitePluginAbell(abellOptions?: AbellOptions): PluginOption {
  let config: {
    root: string;
  };
  return {
    name: 'abell',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async transform(src: string, id: string) {
      // This is hack for dynamic global imports. We can't do dynamic global imports in current codebase
      // resolve pages directory in default entry build
      if (id.endsWith('secret.default.entry.build.js')) {
        const abellDirPath = path
          .relative(path.dirname(id), config.root ?? process.cwd())
          // This isn't OS separator. This is for imports in Vite which are standard '/'
          .replaceAll(path.sep, '/');
        const entryBuildSrc = src.replace(/{{ abellPagesDir }}/g, abellDirPath);
        return { code: entryBuildSrc };
      }

      // transpile abell files into js code
      if (id.endsWith('.abell')) {
        const { code: jsCode, map } = compile(src, {
          filepath: id,
          cwd: process.cwd()
        });
        let outCode = jsCode;
        let outMap = undefined;
        // If loader is not defined, skip the esbuild transform
        if (abellOptions?.esbuild?.loader) {
          const esbuildOut = await transformWithEsbuild(
            jsCode +
              `//# sourceMappingURL=` +
              Buffer.from(map.toString()).toString('base64'),
            id,
            abellOptions.esbuild
          );
          outCode = esbuildOut.code;
          outMap = esbuildOut.map;
        }
        return {
          code: outCode,
          map: outMap ?? map.toString()
        };
      }
    }
  };
}
