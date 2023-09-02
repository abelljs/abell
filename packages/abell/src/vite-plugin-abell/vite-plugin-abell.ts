import path from 'path';
import { PluginOption, transformWithEsbuild } from 'vite';
import { AbellOptions } from '../utils/internal-utils.js';
import { compile } from './compiler/index.js';

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
        const abellDirPath =
          path.relative(path.dirname(id), config.root ?? process.cwd()) +
          path.sep;
        const entryBuildSrc = src.replace(/{{ abellPagesDir }}/g, abellDirPath);
        return { code: entryBuildSrc };
      }

      // transpile abell files into js code
      if (id.endsWith('.abell')) {
        const jsCode = compile(src, {
          filepath: id,
          cwd: process.cwd()
        });
        let outCode = jsCode;
        // If loader is not defined, skip the esbuild transform
        if (abellOptions?.esbuild?.loader) {
          const esbuildOut = await transformWithEsbuild(
            jsCode,
            id,
            abellOptions.esbuild
          );
          outCode = esbuildOut.code;
        }
        return {
          code: outCode
        };
      }
    }
  };
}
