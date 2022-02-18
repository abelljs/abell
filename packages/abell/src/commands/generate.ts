import fs from 'fs';
import path from 'path';
import { build as viteBuild } from 'vite';

import { getPaths } from '../utils/constants';
import {
  getAbellConfig,
  getConfigPath,
  getURLFromFilePath,
  recursiveFindFiles
} from '../utils/general-utils';

async function generate() {
  const cwd = process.cwd();
  const {
    TEMP_OUTPUT_DIR,
    SOURCE_DIR,
    OUTPUT_DIR,
    OUT_ENTRY_BUILD_PATH,
    SOURCE_ENTRY_BUILD_PATH
  } = getPaths({
    cwd
  });

  const configFile = getConfigPath(cwd);

  const abellConfig = await getAbellConfig(configFile);
  let PAGES_ROOT: string;
  if (abellConfig.indexPath) {
    PAGES_ROOT = path.dirname(path.join(cwd, abellConfig.indexPath));
  } else {
    PAGES_ROOT = SOURCE_DIR;
  }

  // Generate server build
  await viteBuild({
    build: {
      outDir: TEMP_OUTPUT_DIR,
      ssr: SOURCE_ENTRY_BUILD_PATH,
      ssrManifest: true
    },
    configFile
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { render } = require(OUT_ENTRY_BUILD_PATH);

  // Generate index.html
  const createdHTMLFiles = [];
  const abellFiles = recursiveFindFiles(PAGES_ROOT, '.abell');
  const urlsToBuild = abellFiles.map((abellFilePath) =>
    getURLFromFilePath(abellFilePath, PAGES_ROOT)
  );

  for (const url of urlsToBuild) {
    // @TODO: make them generate in async mode
    const appHtml = await render(url);
    const htmlPath = path.join(
      PAGES_ROOT,
      `${url === '/' ? 'index' : url}.html`
    );
    fs.writeFileSync(htmlPath, appHtml);
    createdHTMLFiles.push(htmlPath);
  }

  // Static build
  await viteBuild({
    root: PAGES_ROOT,
    build: {
      outDir: OUTPUT_DIR,
      emptyOutDir: true,
      rollupOptions: {
        input: createdHTMLFiles
      }
    },
    configFile
  });

  for (const HTML_FILE of createdHTMLFiles) {
    fs.unlinkSync(HTML_FILE);
  }

  console.log('`npx serve dist` to run static server');
}

function build(): void {
  generate();
}

export default build;
