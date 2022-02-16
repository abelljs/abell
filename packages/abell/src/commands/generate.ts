import fs from 'fs';
import path from 'path';
import { build as viteBuild } from 'vite';

import { getPaths } from '../utils/constants';
import { getConfigPath } from '../utils/general-utils';

async function generate() {
  const cwd = process.cwd();
  const {
    TEMP_OUTPUT_DIR,
    SOURCE_DIR,
    OUTPUT_DIR,
    OUT_ENTRY_BUILD_PATH,
    SOURCE_ENTRY_BUILD_PATH
  } = getPaths({
    cwd: process.cwd()
  });

  const configFile = getConfigPath(cwd);

  // Generate server build
  await viteBuild({
    build: {
      outDir: TEMP_OUTPUT_DIR,
      ssr: SOURCE_ENTRY_BUILD_PATH
    },
    configFile
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { render } = require(OUT_ENTRY_BUILD_PATH);

  // Generate index.html
  const createdHTMLFiles = [];
  const urlsToBuild = ['/'];

  for (const url of urlsToBuild) {
    // @TODO: make them generate in async mode
    const appHtml = await render(url);
    const htmlPath = path.join(
      SOURCE_DIR,
      `${url === '/' ? 'index' : url}.html`
    );
    fs.writeFileSync(htmlPath, appHtml);
    createdHTMLFiles.push(htmlPath);
  }

  // Static build
  await viteBuild({
    root: SOURCE_DIR,
    build: {
      outDir: OUTPUT_DIR,
      emptyOutDir: false,
      rollupOptions: {
        input: createdHTMLFiles
      }
    },
    configFile
  });

  for (const HTML_FILE of createdHTMLFiles) {
    fs.unlinkSync(HTML_FILE);
  }

  console.log('Generated index.html');
  console.log('`npx serve dist` to run static server');
}

function build(): void {
  generate();
}

export default build;
