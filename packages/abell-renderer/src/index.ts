import fs from 'fs';
import path from 'path';

import { UserOptions, AbellComponentMap } from './types';
import { getAbellInBuiltSandbox } from './utils';
import abellParser from './parse-abell';

const defaultUserOptions: UserOptions = {
  basePath: '',
  allowRequire: false,
  allowComponents: false,
  filename: '<sandbox>.abell'
};

export function render(
  abellTemplate: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  userSandbox: object = {},
  options: UserOptions = defaultUserOptions
): AbellComponentMap {
  // Set initial variables
  options.basePath =
    options.basePath ||
    (options.filename && path.dirname(options.filename)) ||
    '';

  const builtInFunctions = getAbellInBuiltSandbox(options);

  // console.log(builtInFunctions);
  abellParser.write(abellTemplate);
  abellParser.end();

  // Add built-in functions along with user's sandbox

  return {
    html: ''
  };
}

export default {
  render
};
