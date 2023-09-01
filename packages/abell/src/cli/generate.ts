import fs from 'fs';
import path from 'path';
import { build as viteBuild } from 'vite';

import {
  getConfigPath,
  getViteBuildInfo,
  createPathIfAbsent
} from '../utils/internal-utils.js';

import { Route } from '../type-utils';
import { bold, log, viteCustomLogger } from '../utils/logger.js';

async function generate(): Promise<void> {
  const cwd = process.cwd();
  const configFile = getConfigPath(cwd);

  const {
    TEMP_OUTPUT_DIR,
    ROOT,
    OUTPUT_DIR,
    OUT_ENTRY_BUILD_PATH,
    SOURCE_ENTRY_BUILD_PATH
  } = await getViteBuildInfo({
    configFile,
    command: 'generate'
  });

  // Generate server build
  await viteBuild({
    build: {
      outDir: TEMP_OUTPUT_DIR,
      ssr: true,
      rollupOptions: {
        input: SOURCE_ENTRY_BUILD_PATH,
        external: ['abell']
      },
      ssrManifest: true
    },
    ssr: {
      external: ['abell']
    },
    logLevel: 'error',
    customLogger: viteCustomLogger,
    configFile
  });

  let routes: Route[] = [];
  const MJS_OUT_ENTRY_BUILD_PATH = OUT_ENTRY_BUILD_PATH.replace(
    'entry.build.js',
    'entry.build.mjs'
  );
  try {
    const { makeRoutes } = await import(OUT_ENTRY_BUILD_PATH);
    routes = await makeRoutes();
  } catch (err) {
    const { makeRoutes } = await import(MJS_OUT_ENTRY_BUILD_PATH);
    routes = await makeRoutes();
  }

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
    customLogger: viteCustomLogger,
    configFile
  });

  for (const HTML_FILE of createdHTMLFiles) {
    fs.unlinkSync(HTML_FILE);
  }

  // remove directories
  for (const newDir of createdDirectories) {
    fs.rmdirSync(newDir);
  }

  log(
    `✨ Site Generated ✨ \n\n${bold('npx serve dist')} to run static server`
  );
}

export default generate;
