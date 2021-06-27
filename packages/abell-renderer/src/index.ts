import path from 'path';

import {
  UserOptions,
  AbellComponentMap,
  UserOptionsAllowComponents
} from './types';
import { getAbellInBuiltSandbox } from './utils/general-utils';
import { compile, newCompile } from './parsers/abell-parser';

const defaultUserOptions: UserOptions = {
  basePath: '',
  allowRequire: false,
  allowComponents: false,
  filename: '<sandbox>.abell'
};

export function render(
  abellTemplate: string,
  userSandbox?: Record<string, unknown>,
  options?: UserOptionsAllowComponents
): AbellComponentMap;

export function render(
  abellTemplate: string,
  userSandbox?: Record<string, unknown>,
  options?: UserOptions
): string;

export function render(
  abellTemplate: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  userSandbox: Record<string, unknown> = {},
  options: UserOptions = defaultUserOptions
): AbellComponentMap | string {
  // Set initial variables
  options.basePath =
    options.basePath ||
    (options.filename && path.dirname(options.filename)) ||
    '';

  const builtInFunctions = getAbellInBuiltSandbox(options);
  // console.log(builtInFunctions);
  // abellParser.write(abellTemplate);
  // abellParser.end();
  const templateSandbox = {
    ...builtInFunctions,
    ...userSandbox
  };

  let html;

  if (options.useNewCompiler) {
    html = newCompile(abellTemplate, templateSandbox, options);
    return html;
  }

  html = compile(abellTemplate, templateSandbox, options);
  return html;

  // Add built-in functions along with user's sandbox

  // return {
  //   html: ''
  // };
}

export default {
  render
};
