import fs from 'fs';
import path from 'path';

type UserOptions = {
  basePath: string;
  filename: string;
  allowRequire: boolean;
  allowComponents: boolean;
};

type AbellComponentMap = {
  html: string;
  components?: Array<AbellComponentMap>;
  styles?: {
    attributes: Array<string>;
    component: string;
    componentPath: string;
    content: string;
  };
  scripts?: {
    attributes: Array<string>;
    component: string;
    componentPath: string;
    content: string;
  };
};

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

  // Add built-in functions along with user's sandbox

  return {
    html: ''
  };
}

export default {
  render
};
