import fs from 'fs';
import path from 'path';
import { build as viteBuild } from 'vite';

import {
  getConfigPath,
  getViteBuildInfo,
  createPathIfAbsent,
  addCSSToHead,
  addJStoBodyEnd,
  existsSync
} from '../utils/internal-utils.js';
import {
  CSS_FETCH_REGEX,
  JS_FETCH_REGEX,
  getCSSLinks,
  getImportTemplatePage,
  getImportsHash,
  getJSLinks
} from '../utils/import-hashing.js';

import { Route } from '../type-utils';
import {
  bold,
  dim,
  log,
  viteCustomLogger,
  blue,
  reset
} from '../utils/logger.js';

async function generate(): Promise<void> {
  const startTime = performance.now();
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
      ...viteConfigObj.abell?.serverBuild,
      outDir: TEMP_OUTPUT_DIR,
      ssr: true,
      rollupOptions: {
        ...viteConfigObj.abell?.serverBuild?.rollupOptions,
        input: SOURCE_ENTRY_BUILD_PATH,
        external: ['abell'],
        onLog: (level, logObj) => {
          // Ignoring unused abell block warning
          if (level === 'warn' && logObj.code !== 'UNUSED_EXTERNAL_IMPORT') {
            log(logObj.message, 'p1', { logLevel: viteConfigObj.logLevel });
          }
        }
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
  if (existsSync(OUT_ENTRY_BUILD_PATH)) {
    const { makeRoutes } = await import(OUT_ENTRY_BUILD_PATH);
    routes = await makeRoutes();
  } else {
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
  let importTemplatesMemo: Record<string, { htmlPath: string }> = {};
  const shouldOptimizeTransformations =
    viteConfigObj.abell?.optimizedTransformations ?? true;

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

      const { importsStringDump, importsHash } = getImportsHash({
        ROOT,
        appHtml,
        htmlPath
      });

      if (
        importsStringDump &&
        importTemplatesMemo[importsHash] &&
        shouldOptimizeTransformations
      ) {
        transformationSkippedHTMLFiles.push({
          importsHash,
          htmlPath,
          appHtml
        });
      } else {
        if (shouldOptimizeTransformations) {
          importTemplatesMemo[importsHash] = { htmlPath };
        }
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

    if (
      shouldOptimizeTransformations &&
      transformationSkippedHTMLFiles.length > 0
    ) {
      const writePromises: Promise<void>[] = [];
      for (const unTransformed of transformationSkippedHTMLFiles) {
        const templatePage = getImportTemplatePage({
          ROOT,
          OUTPUT_DIR,
          importTemplatesMemo,
          importsHash: unTransformed.importsHash
        });
        const cssLinks = getCSSLinks(templatePage);
        const jsLinks = getJSLinks(templatePage);
        const htmlWithCSS = addCSSToHead(
          unTransformed.appHtml.replace(CSS_FETCH_REGEX, ''),
          cssLinks
        );
        const htmlWithCSSAndJS = addJStoBodyEnd(
          htmlWithCSS.replace(JS_FETCH_REGEX, ''),
          jsLinks
        );

        const htmlOutPath = path.join(
          OUTPUT_DIR,
          path.relative(ROOT, unTransformed.htmlPath)
        );

        const writePromise = fs.promises
          .writeFile(htmlOutPath, htmlWithCSSAndJS)
          .then(() => {
            log(
              `${reset}${dim(
                path.dirname(path.relative(ROOT, htmlOutPath)) + '/'
              )}${blue(path.basename(htmlOutPath))}`,
              'p1',
              {
                icon: '⚡️',
                logLevel: viteConfigObj.logLevel
              }
            );
          });
        writePromises.push(writePromise);
      }

      await Promise.all(writePromises);

      log(
        `Created ${transformationSkippedHTMLFiles.length} files with optimized transformations 🚀`,
        'p1',
        { logLevel: viteConfigObj.logLevel }
      );
    }
  } finally {
    // CLEANUP
    for (const HTML_FILE of createdHTMLFiles) {
      fs.unlinkSync(HTML_FILE);
    }

    // remove directories
    for (const newDir of createdDirectories) {
      fs.rmdirSync(newDir);
    }

    importTemplatesMemo = {};
  }

  const buildTime = parseFloat(
    String((performance.now() - startTime) / 1000)
  ).toFixed(2);

  log(
    `✨ Site Generated in ${blue(`${buildTime}s`)} ✨ \n\n${bold(
      'npx serve dist'
    )} to run static server`,
    'p0',
    { logLevel: viteConfigObj.logLevel }
  );
}

export default generate;
