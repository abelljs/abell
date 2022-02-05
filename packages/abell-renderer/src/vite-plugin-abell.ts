import path from 'path';
import { compile } from './compiler';
const fileRegex = /\.abell$/;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function vitePluginAbell() {
  return {
    name: 'transform-file',

    transform(src: string, id: string) {
      if (fileRegex.test(id)) {
        const filename = path.relative(process.cwd(), id);
        const code = compile(src, filename);
        return {
          code,
          map: null // provide source map if available
        };
      }
    }
  };
}
