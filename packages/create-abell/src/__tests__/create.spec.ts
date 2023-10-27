/* eslint-disable max-len */
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi
} from 'vitest';
import create from '../create';
import { deleteDir, windowsifyCommand } from '../utils.js';

const testUtilsDir = path.join(__dirname, 'test-utils', 'scaffolds');

vi.mock('child_process');

// Shoutout to chatgpt for this function
const makeTree = (directoryPath: string, indent = 0) => {
  const files = fs
    .readdirSync(directoryPath)
    // sorting to make directory read sequence same
    .sort((a, b) => (a.length > b.length ? 1 : -1));

  let tree = '';

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);
    const isDirectory = stats.isDirectory();

    tree += ' '.repeat(indent * 2);
    tree += isDirectory ? '├── ' + file + '\n' : '└── ' + file + '\n';

    if (isDirectory) {
      tree += makeTree(filePath, indent + 1);
    }
  });

  return tree;
};

beforeAll(() => {
  deleteDir(testUtilsDir);
});

afterAll(() => {
  deleteDir(testUtilsDir);
});

describe('create', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue(testUtilsDir);
    // @ts-expect-error: only mocking what is used
    spawn.mockImplementation(() => {
      const mockChildProcess = {
        stdout: { on: vi.fn() }, // Mock stdout behavior if needed
        stderr: { on: vi.fn() }, // Mock stderr behavior if needed
        on: vi.fn()
      };
      return mockChildProcess;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    deleteDir(path.join(testUtilsDir, 'hello-abell'));
  });

  test('should create project with default template', async () => {
    await create('hello-abell', {
      installer: 'skip',
      template: 'default'
    });

    expect(spawn).not.toBeCalled();
    expect(fs.existsSync(path.join(testUtilsDir, 'hello-abell'))).toBe(true);
    expect(makeTree(path.join(testUtilsDir, 'hello-abell')))
      .toMatchInlineSnapshot(`
        "├── public
          └── abell-logo.svg
        └── config.js
        └── index.abell
        └── about.abell
        ├── _components
          └── navbar.abell
          └── global.meta.abell
        └── package.json
        ├── client-assets
          └── global.css
          └── index-client.js
        "
      `);
  });

  test('should create project with default template and bun installer', async () => {
    await create('hello-abell', {
      installer: 'bun',
      template: 'default'
    });

    const expectedCommand = 'bun install';
    const commandArgs = windowsifyCommand(expectedCommand).split(' ');

    expect(spawn).toBeCalledWith(commandArgs[0], [commandArgs[1]], {
      cwd: path.join(testUtilsDir, 'hello-abell'),
      stdio: 'inherit'
    });

    const packageJSONPath = path.join(
      testUtilsDir,
      'hello-abell',
      'package.json'
    );
    const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8'));

    expect(packageJSON.name).toBe('hello-abell');
    expect(packageJSON.scripts).toMatchInlineSnapshot(`
      {
        "dev": "bunx --bun abell dev",
        "generate": "bunx --bun abell generate",
      }
    `);
  });
});
