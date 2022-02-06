import fs from 'fs';
import path from 'path';
import { build as viteBuild } from 'vite';

import { getPaths } from './constants.js';

async function generate() {
  const { TEMP_OUTPUT_DIR, SOURCE_DIR, OUTPUT_DIR, ENTRY_BUILD_PATH } =
    getPaths({
      env: 'production',
      cwd: process.cwd()
    });

  // Generate server build
  await viteBuild({
    build: {
      outDir: TEMP_OUTPUT_DIR,
      ssr: path.join(SOURCE_DIR, 'entry.build.ts')
    }
  });

  // Generate index.html
  const createdHTMLFiles = [];
  const INDEX_HTML_PATH = path.join(SOURCE_DIR, 'index.html');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { render } = require(ENTRY_BUILD_PATH);
  const appHtml = await render('/');
  fs.writeFileSync(INDEX_HTML_PATH, appHtml);
  createdHTMLFiles.push(INDEX_HTML_PATH);

  // Static build
  await viteBuild({
    root: SOURCE_DIR,
    build: {
      outDir: OUTPUT_DIR,
      emptyOutDir: true,
      rollupOptions: {
        input: createdHTMLFiles
      }
    }
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
