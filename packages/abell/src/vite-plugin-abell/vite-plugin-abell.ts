import path from 'path';
import { PluginOption } from 'vite';
import { compile } from './compiler';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function vitePluginAbell(): PluginOption {
  let config: {
    root: string;
  };
  return {
    name: 'abell',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transform(src: string, id: string) {
      // This is hack for dynamic global imports. We can't do dynamic global imports in current codebase
      // resolve pages directory in default entry build
      if (id.endsWith('secret.default.entry.build.js')) {
        const abellDirPath = path.relative(
          path.dirname(id),
          config.root ?? process.cwd()
        );
        const abellIndexPath = path.join(__dirname, '..', 'index');
        const entryBuildSrc = src
          .replace(/{{ abellPagesDir }}/g, abellDirPath)
          .replace(/{{ abellIndexPath }}/g, abellIndexPath);
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
