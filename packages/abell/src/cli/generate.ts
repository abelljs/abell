import fs from 'fs';
import path from 'path';
import { build as viteBuild } from 'vite';

import {
  getConfigPath,
  getViteBuildInfo,
  createPathIfAbsent,
  addCSSToHead,
  addJStoBodyEnd
} from '../utils/internal-utils.js';

import { Route } from '../type-utils';
import { bold, log, viteCustomLogger } from '../utils/logger.js';
import { generateHashFromPath } from '../vite-plugin-abell/compiler/scope-css/generate-hash.js';

const CSS_FETCH_REGEX = /<link.*?href="(.*?)".*?\/?>/g;
const JS_FETCH_REGEX = /<script src="(.*?)">/g;

const getImportsHash = (
  appHtml: string
): {
  importsStringDump: string;
  importsHash: string;
} => {
  const importsStringDump = [
    ...Array.from(appHtml?.matchAll(CSS_FETCH_REGEX)),
    ...Array.from(appHtml.matchAll(JS_FETCH_REGEX))
  ]
    .map((linkMatch) => linkMatch[0])
    .join('\n');

  const newTemplateEntryHash = generateHashFromPath(importsStringDump);

  return {
    importsStringDump: importsStringDump,
    importsHash: newTemplateEntryHash
  };
};

async function generate(): Promise<void> {
  const cwd = process.cwd();
  const configFile = getConfigPath(cwd);

  const {
    TEMP_OUTPUT_DIR,
    ROOT,
    OUTPUT_DIR,
    OUT_ENTRY_BUILD_PATH,
    SOURCE_ENTRY_BUILD_PATH,
    viteConfigObj
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
        external: ['abell'],
        onLog: (level, logObj) => {
          // Ignoring unused abell block warning
          if (level === 'warn' && logObj.code !== 'UNUSED_EXTERNAL_IMPORT') {
            log(logObj.message, 'p1');
          }
        }
      },
      ssrManifest: true,
      ...viteConfigObj.abell?.serverBuild
    },
    ssr: {
      external: ['abell']
    },
    logLevel: 'error',
    customLogger: viteCustomLogger,
    configFile
  });

  let routes: Route[] = [];
  try {
    const { makeRoutes } = await import(OUT_ENTRY_BUILD_PATH);
    routes = await makeRoutes();
  } catch (err) {
    const MJS_OUT_ENTRY_BUILD_PATH = OUT_ENTRY_BUILD_PATH.replace(
      'entry.build.js',
      'entry.build.mjs'
    );
    const { makeRoutes } = await import(MJS_OUT_ENTRY_BUILD_PATH);
    routes = await makeRoutes();
  }

  // Generate index.html
  const createdHTMLFiles: string[] = [];
  const transformationSkippedHTMLFiles = [];
  const createdDirectories: string[] = [];
  const memoizedTemplates: Record<string, { htmlPath: string }> = {};

  try {
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

      const { importsStringDump, importsHash } = getImportsHash(appHtml);

      if (importsStringDump && memoizedTemplates[importsHash]) {
        log('Skip transform', 'p1');
        transformationSkippedHTMLFiles.push({
          importsHash,
          htmlPath,
          appHtml
        });
      } else {
        log('Do transform', 'p1');
        memoizedTemplates[importsHash] = { htmlPath };
        const newDirs = createPathIfAbsent(path.dirname(htmlPath));
        createdDirectories.push(...newDirs);
        fs.writeFileSync(htmlPath, appHtml);
        createdHTMLFiles.push(htmlPath);
      }
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

    for (const unTransformed of transformationSkippedHTMLFiles) {
      const relativeToRootHTMLPath = path.relative(
        ROOT,
        memoizedTemplates[unTransformed.importsHash].htmlPath
      );
      const distHTMLPath = path.join(OUTPUT_DIR, relativeToRootHTMLPath);
      const templatePage = fs.readFileSync(distHTMLPath, 'utf-8');
      const cssLinks = Array.from(templatePage.matchAll(CSS_FETCH_REGEX))
        .map((linkMatch) => linkMatch[0])
        .join('\n');
      const jsLinks = Array.from(templatePage.matchAll(JS_FETCH_REGEX))
        .map((linkMatch) => linkMatch[0])
        .join('\n');
      const htmlWithCSS = addCSSToHead(
        unTransformed.appHtml.replace(CSS_FETCH_REGEX, ''),
        cssLinks
      );
      const htmlWithCSSAndJS = addJStoBodyEnd(
        htmlWithCSS.replace(JS_FETCH_REGEX, ''),
        jsLinks
      );
      fs.writeFileSync(
        path.join(OUTPUT_DIR, path.relative(ROOT, unTransformed.htmlPath)),
        htmlWithCSSAndJS
      );
      log(
        `Created ${path.relative(
          ROOT,
          unTransformed.htmlPath
        )} without transformations`,
        'p1'
      );
    }
    // We can then loop over untransformed files, match them with their transformed URLs using memoHash
    // Then remove the existing Link and script URLs from them and add new URLs fetched from template
  } finally {
    // CLEANUP
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
}

export default generate;
