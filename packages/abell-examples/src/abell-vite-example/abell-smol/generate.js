const fs = require('fs');
const path = require('path');
const { build: viteBuild } = require('vite');

const { SOURCE_DIR, TEMP_OUTPUT_DIR, OUTPUT_DIR } = require('./constants.js');

(async () => {
  // Generate server build
  await viteBuild({
    build: {
      outDir: TEMP_OUTPUT_DIR,
      ssr: path.join(SOURCE_DIR, 'entry.build.ts')
    }
  });

  // Generate index.html
  const INDEX_HTML_PATH = path.join(TEMP_OUTPUT_DIR, 'index.html');
  const { render } = require(path.join(TEMP_OUTPUT_DIR, 'entry.build.js'));
  const appHtml = await render('/');
  fs.writeFileSync(INDEX_HTML_PATH, appHtml);

  // Static build
  await viteBuild({
    root: TEMP_OUTPUT_DIR,
    build: {
      outDir: OUTPUT_DIR,
      emptyOutDir: true,
      rollupOptions: {
        input: INDEX_HTML_PATH,
        output: {
          dir: OUTPUT_DIR
        }
      }
    }
  });

  console.log('Generated index.html');
  console.log('`npx serve dist` to run static server');
})();
