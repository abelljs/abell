import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { JSDOM } from 'jsdom';

const isWindows = /^win/.test(process.platform);

const windowsifyCommand = (command: string): string => {
  if (isWindows) {
    return command.replace('pnpm', 'pnpm.cmd');
  }

  return command;
};

let dir: string = __dirname;
export async function run(
  cwd: string,
  stdio: 'pipe' | 'inherit' = 'pipe'
): Promise<string> {
  dir = cwd;
  return new Promise((resolve, reject) => {
    const child = spawn(windowsifyCommand('pnpm'), ['generate'], {
      cwd,
      stdio
    });
    let terminalOutput = '';

    child.stdout?.on('data', (data) => {
      console.log('stdout==', data.toString());
      terminalOutput += data;
    });

    child.stderr?.on('data', (data) => {
      console.log('stderr==', data.toString());
    });

    child.on('close', (code: number) => {
      if (code === 0) {
        resolve(terminalOutput);
      } else {
        console.log('close==', code);
        // eslint-disable-next-line prefer-promise-reject-errors
        reject();
      }
    });

    child.on('error', (err) => {
      console.log('err==', err);
    });
  });
}

export const getDocument = (fileName: string): Document => {
  const htmlFileContent = fs.readFileSync(
    path.join(dir, 'dist', fileName),
    'utf-8'
  );

  const dom = new JSDOM(htmlFileContent);
  return dom.window.document;
};
