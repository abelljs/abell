import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const isWindows = /^win/.test(process.platform);
const reset = '\u001b[0m';
const terminalSpace = process.env.TERM_PROGRAM === 'vscode' ? '' : ' ';
const TOTAL_STEPS = 3;

export const relative = (pathString: string): string =>
  path.relative(process.cwd(), pathString);

export const colors = {
  bold: (message: string): string => `\u001b[1m${message}${reset}`,
  red: (message: string): string =>
    `\u001b[1m\u001b[31m${message}\u001b[39m\u001b[22m`,
  blue: (message: string): string => `\u001b[34m${message}${reset}`,
  green: (message: string): string =>
    `\u001b[1m\u001b[32m${message}\u001b[39m${reset}`
};

const getPrefix = (status: 'success' | 'failure' | 'info', step?: number) => {
  let icon = colors.blue('‣');
  if (status === 'success') {
    icon = colors.green('✓');
  }

  if (status === 'failure') {
    icon = colors.red('✖');
  }

  let stepText = '';
  if (step && step >= 0) {
    stepText = `${reset}\x1b[3m(${step}/${TOTAL_STEPS})${reset} `;
  }

  return (
    reset +
    icon +
    colors.bold(` 🌀${terminalSpace}create-abell ${stepText}${terminalSpace}‣`)
  );
};

export const log = {
  success: (message: string, step?: number): void => {
    console.log('');
    console.log(getPrefix('success', step), `${message}`);
  },
  failure: (message: string, shouldLog = true): string => {
    const coloredMessage = `${getPrefix('failure')} ${message}`;
    if (shouldLog) {
      console.log('');
      console.error(coloredMessage);
      console.log('');
    }
    return coloredMessage;
  },
  info: (message: string, step?: number): void => {
    console.log(`${getPrefix('info', step)} ${message}`);
  }
};

export const normalizePath = (pathString: string): string =>
  pathString.split('/').join(path.sep);

export const windowsifyCommand = (command: string): string => {
  if (isWindows) {
    return command
      .replace('npm', 'npm.cmd')
      .replace('yarn', 'yarn.cmd')
      .replace('pnpm', 'pnpm.cmd')
      .replace('bun', 'bun.cmd');
  }

  return command;
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

      // In test we want to return from here since we don't want to wait for on('close') to be called
      if (process.env.NODE_ENV === 'test') {
        return resolve(0);
      }

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
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== 'ENOTEMPTY') throw err;
        }
      }
    }
  });
}

export function deleteDir(unNormalizedPathToRemove: string): void {
  const pathToRemove = normalizePath(unNormalizedPathToRemove);
  if (fs.existsSync(pathToRemove)) {
    fs.readdirSync(pathToRemove).forEach((file) => {
      const curPath = path.join(pathToRemove, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteDir(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToRemove);
  }
}

export const packageManagerRunMap = {
  'yarn install': 'yarn dev',
  'npm install': 'npm run dev',
  'bun install': 'bun dev',
  'pnpm install': 'pnpm dev'
} as const;
