import { compile } from './compiler';
const fileRegex = /\.abell$/;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function abellVitePlugin() {
  return {
    name: 'transform-file',

    transform(src: string, id: string) {
      if (fileRegex.test(id)) {
        return {
          code: compile(src),
          map: null // provide source map if available
        };
      }
    }
  };
}
