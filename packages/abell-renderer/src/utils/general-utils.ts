import fs from 'fs';
import path from 'path';
import { UserOptions, NodeBuiltins } from '../types';

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

type ExecMatches = {
  matches: RegExpExecArray[];
  input: string;
};

export const execRegexOnAll = (
  regex: RegExp,
  template: string
): ExecMatches => {
  /** allMatches holds all the results of RegExp.exec() */
  const allMatches = [];
  let match = regex.exec(template);
  if (!match) {
    return { matches: [], input: template };
  }

  const { input } = match;

  while (match !== null) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete match.input;
    allMatches.push(match);
    match = regex.exec(template);
  }

  return { matches: allMatches, input };
};

export const isComponentImported = (abellCode: string): boolean =>
  /(?:const|var|let) (\w*) *?= *?require\(["'`](.*?)\.abell["'`]\)/g.test(
    abellCode
  );