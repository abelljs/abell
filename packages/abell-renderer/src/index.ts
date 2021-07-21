import path from 'path';

import {
  UserOptions,
  OutputWithComponent,
  UserOptionsAllowComponents
} from './types';
import { getAbellInBuiltSandbox } from './utils/general-utils';
import { compile } from './parsers/abell-parser';

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
): OutputWithComponent;

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
): OutputWithComponent | string {
  // Set initial variables
  options.basePath =
    options.basePath ||
    (options.filename && path.dirname(options.filename)) ||
    '';

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

export default {
  render
};
