import fs from 'fs';
import path from 'path';
import { build as viteBuild } from 'vite';

import {
  getConfigPath,
  getBasePaths,
  createPathIfAbsent
} from '../utils/internal-utils';
// @ts-expect-error
import loadModule from '../../defaults/loadModule.js';
import { Route } from '../type-utils';

async function generate(): Promise<void> {
  const cwd = process.cwd();
  const configFile = getConfigPath(cwd);

  const {
    TEMP_OUTPUT_DIR,
    ROOT,
    OUTPUT_DIR,
    OUT_ENTRY_BUILD_PATH,
    SOURCE_ENTRY_BUILD_PATH
  } = await getBasePaths({
    configFile,
    command: 'generate'
  });

  // Generate server build
  await viteBuild({
    build: {
      outDir: TEMP_OUTPUT_DIR,
      ssr: SOURCE_ENTRY_BUILD_PATH,
      ssrManifest: true
    },
    logLevel: 'warn',
    configFile
  });

  const { makeRoutes } = await loadModule(OUT_ENTRY_BUILD_PATH);
  const routes: Route[] = await makeRoutes();

  // Generate index.html
  const createdHTMLFiles = [];
  const createdDirectories = [];

  for (const route of routes) {
    const appHtml = route.render();
    if (!appHtml) continue;
    let htmlPath = path.join(
      ROOT,
      `${route.path === '/' ? 'index' : route.path}.html`
    );
    if (route.routeOptions?.outputPathPattern === '[route]/index.html') {
      htmlPath = path.join(ROOT, route.path, 'index.html');
    }
    const newDirs = createPathIfAbsent(path.dirname(htmlPath));
    createdDirectories.push(...newDirs);
    fs.writeFileSync(htmlPath, appHtml);
    createdHTMLFiles.push(htmlPath);
  }

  // Static build
  await viteBuild({
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

  // remove directories
  for (const newDir of createdDirectories) {
    fs.rmdirSync(newDir);
  }

  console.log('`npx serve dist` to run static server');
}

export default generate;
