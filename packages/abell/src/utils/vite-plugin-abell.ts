import path from 'path';
import { compile } from '../compiler';
const fileRegex = /\.abell$/;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function vitePluginAbell() {
  return {
    name: 'abell',
    // @TODO: figure out a way to dynamically import all abell pages in entry.build.ts
    // resolveId(id: string) {
    //   if (id === virtualModuleId) {
    //     return resolvedVirtualModuleId;
    //   }
    // },
    // load(id: string) {
    //   if (id === resolvedVirtualModuleId) {
    //     return `export const msg = "from virtual module"`;
    //   }
    // },
    transform(src: string, id: string) {
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
