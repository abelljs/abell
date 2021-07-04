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

export const createPathIfAbsent = (pathToCreate: string): void => {
  // prettier-ignore
  pathToCreate
    .split(path.sep)
    .reduce((prevPath, folder) => {
      const currentPath = path.join(prevPath, folder, path.sep);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
      return currentPath;
    }, '');
};

export const copyFolderSync = (
  from: string,
  to: string,
  ignore: string[] = [],
  ignoreEmptyDirs = true
): void => {
  if (ignore.includes(from)) {
    return;
  }
  const fromDirectories = fs.readdirSync(from);

  createPathIfAbsent(to);
  fromDirectories.forEach((element) => {
    const fromElement = path.join(from, element);
    const toElement = path.join(to, element);
    if (fs.lstatSync(fromElement).isFile()) {
      if (!ignore.includes(fromElement)) {
        fs.copyFileSync(fromElement, toElement);
      }
    } else {
      copyFolderSync(fromElement, toElement, ignore);
      if (fs.existsSync(toElement) && ignoreEmptyDirs) {
        try {
          fs.rmdirSync(toElement);
        } catch (err) {
          if (err.code !== 'ENOTEMPTY') throw err;
        }
      }
    }
  });
};
