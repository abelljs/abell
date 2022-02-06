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
  const createdHTMLFiles = [];
  const INDEX_HTML_PATH = path.join(SOURCE_DIR, 'index.html');
  const { render } = require(path.join(TEMP_OUTPUT_DIR, 'entry.build.js'));
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
})();
