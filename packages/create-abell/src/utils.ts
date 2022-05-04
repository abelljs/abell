import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const isWindows = /^win/.test(process.platform);

export const colors = {
  red: (message: string): string =>
    `\u001b[1m\u001b[31m${message}\u001b[39m\u001b[22m`,
  cyan: (message: string): string => `\u001b[36m${message}\u001b[39m`,
  green: (message: string): string =>
    `\u001b[1m\u001b[32m${message}\u001b[39m\u001b[22m`
};

export const normalizePath = (pathString: string): string =>
  pathString.split('/').join(path.sep);

const windowsifyCommand = (command: string): string => {
  if (!isWindows) {
    return command;
  }

  return command.replace('npm', 'npm.cmd').replace('yarn', 'yarn.cmd');
};

export async function run(
  command: string,
  { cwd }: { cwd: string } = { cwd: process.cwd() }
): Promise<1 | 0> {
  const commandArgs = windowsifyCommand(command).split(' ');
  return new Promise((resolve, reject) => {
    try {
      const child = spawn(commandArgs[0], [...commandArgs.slice(1)], {
        cwd,
        stdio: 'inherit'
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(0);
        } else {
          console.log(`oops ${command} failed`);
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(1);
        }
      });
    } catch (err) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(1);
    }
  });
}

// fs methods

/**
 * Recursively creates the path
 * @param {String} pathToCreate path that you want to create
 */
function createPathIfAbsent(pathToCreate: string) {
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
}

/**
 *
 * @param {string} from - Path to copy from
 * @param {string} to - Path to copy to
 * @param {string[]} ignore - files/directories to ignore
 * @param {boolean} ignoreEmptyDirs - Ignore empty directories while copying
 * @return {void}
 */
export function copyFolderSync(
  from: string,
  to: string,
  ignore: string[] = [],
  ignoreEmptyDirs = true
): void {
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
        fs.copyFileSync(
          fromElement,
          toElement.replace(/gitignore/g, '.gitignore')
        );
      }
    } else {
      copyFolderSync(fromElement, toElement, ignore);
      if (fs.existsSync(toElement) && ignoreEmptyDirs) {
        try {
          fs.rmdirSync(toElement);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          if (err.code !== 'ENOTEMPTY') throw err;
        }
      }
    }
  });
}
