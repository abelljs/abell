import fs from 'fs';
import path from 'path';
import { build as viteBuild } from 'vite';

import {
  getConfigPath,
  getBasePaths,
  createPathIfAbsent
} from '../utils/internal-utils';
import { Route } from '../type-utils';

async function generate(): Promise<void> {
  const cwd = process.cwd();
  const configFile = getConfigPath(cwd);

  const {
    TEMP_OUTPUT_DIR,
    PAGES_ROOT,
    OUTPUT_DIR,
    OUT_ENTRY_BUILD_PATH,
    SOURCE_ENTRY_BUILD_PATH
  } = await getBasePaths({
    cwd
  });

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
  const { makeRoutes } = require(OUT_ENTRY_BUILD_PATH);
  const routes: Route[] = await makeRoutes();

  // Generate index.html
  const createdHTMLFiles = [];

  for (const route of routes) {
    const appHtml = route.render();
    if (!appHtml) continue;
    const htmlPath = path.join(
      PAGES_ROOT,
      `${route.path === '/' ? 'index' : route.path}.html`
    );
    createPathIfAbsent(path.dirname(htmlPath));
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

export default generate;
