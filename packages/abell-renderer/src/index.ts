import fs from 'fs';
import path from 'path';

import {
  UserOptions,
  OutputWithComponent,
  UserOptionsAllowComponents,
  UserOptionsBase
} from './types';
import { getAbellInBuiltSandbox } from './utils/general-utils';
import { compile } from './compiler';

const defaultUserOptions: UserOptions = {
  basePath: '',
  dangerouslyAllowRequire: false,
  allowComponents: false,
  filename: '<sandbox>.abell',
  baseWorkingDirectory: process.cwd()
};

export function render(
  abellTemplate: string,
  userSandbox: Record<string, unknown>,
  userOptions: UserOptionsAllowComponents
): OutputWithComponent;

export function render(
  abellTemplate: string,
  userSandbox?: Record<string, unknown>,
  userOptions?: UserOptions
): string;

export function render(
  abellTemplate: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  userSandbox: Record<string, unknown> = {},
  userOptions: UserOptions = defaultUserOptions
): string | OutputWithComponent {
  // Set initial variables
  const options = {
    ...defaultUserOptions,
    ...userOptions,
    basePath:
      userOptions.basePath ||
      (userOptions.filename && path.dirname(userOptions.filename)) ||
      ''
  };

  const { builtInFunctions, subComponents } = getAbellInBuiltSandbox(options);

  const templateSandbox = {
    ...builtInFunctions,
    ...userSandbox
  };

  const html = compile(abellTemplate, templateSandbox, options);

  if (options.allowComponents) {
    return {
      html,
      components: subComponents
    };
  }

  return html;
}

export function engine(
  { dangerouslyAllowRequire } = { dangerouslyAllowRequire: false }
) {
  return (
    filePath: string,
    options: UserOptionsBase,
    callback: (_: null, rendered: string) => string
  ): string => {
    // define the template engine
    const content = fs.readFileSync(filePath, 'utf-8');
    const rendered = render(content, options, {
      basePath: path.dirname(filePath),
      dangerouslyAllowRequire
    });
    return callback(null, rendered);
  };
}

export * from './types';

export default {
  render,
  engine
};
