/**
 * This file is for playing around build in local setup. This is ignored in npm publish
 */
import path from 'path';
import build from './commands/build';

build({
  baseWorkingDir: path.join(__dirname, '..', 'dev-example')
});
