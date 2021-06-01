import fs from 'fs';
import path from 'path';
import { UserOptions, NodeBuiltins } from './types';

export function getAbellInBuiltSandbox(options: UserOptions): NodeBuiltins {
  const builtInFunctions: NodeBuiltins = {
    console: {
      log: console.log
    },
    __filename: options.filename ? path.resolve(options.filename) : undefined,
    __dirname: options.basePath ? path.resolve(options.basePath) : undefined
  };

  if (options.allowRequire) {
    builtInFunctions.require = (pathToRequire) => {
      const fullRequirePath = path.join(options.basePath ?? '', pathToRequire);

      if (fs.existsSync(fullRequirePath)) {
        // Local file require
        return require(fullRequirePath);
      }

      try {
        // NPM Package or NodeJS Module
        return require(pathToRequire);
      } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
          // throw custom error here.
          throw new Error('MODULE_NOT_FOUND');
        } else {
          throw err;
        }
      }
    };
  }

  return builtInFunctions;
}
