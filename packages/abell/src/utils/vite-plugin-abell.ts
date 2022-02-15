import path from 'path';
import { compile } from '../compiler';
import { AbellOptions } from './general-utils';
const fileRegex = /\.abell$/;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function vitePluginAbell(abellConfig: AbellOptions) {
  return {
    name: 'abell',
    transform(src: string, id: string) {
      // resolve pages directory in default entry build
      if (id.endsWith('secret.default.entry.build.js')) {
        if (!abellConfig?.pagesDir) {
          throw new Error('Oops no pagesDir config found in vite.config');
        }
        const userConfiguredPagesDir = path.join(
          process.cwd(),
          abellConfig.pagesDir
        );
        const abellDirPath = path.relative(__dirname, userConfiguredPagesDir);
        const entryBuildSrc = src.replaceAll(
          '{{ abellPagesDir }}',
          abellDirPath
        );
        return { code: entryBuildSrc };
      }

      if (fileRegex.test(id)) {
        const filename = path.relative(process.cwd(), id);
        const code = compile(src, filename);
        return {
          code
        };
      }
    }
  };
}
