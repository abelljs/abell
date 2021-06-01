import fs from 'fs';
import path from 'path';

import { UserOptions, AbellComponentMap } from './types';
import { getAbellInBuiltSandbox } from './utils';

const defaultUserOptions: UserOptions = {
  basePath: '',
  allowRequire: false,
  allowComponents: false,
  filename: '<sandbox>.abell'
};

function render(
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

  console.log(builtInFunctions);

  // Add built-in functions along with user's sandbox

  return {
    html: ''
  };
}

render(`<div></div>`, {}, { basePath: __dirname });

export default {
  render
};
