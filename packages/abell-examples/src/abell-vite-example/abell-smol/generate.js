const fs = require('fs');
const path = require('path');

const INDEX_HTML_PATH = path.resolve(__dirname, '../dist/static/index.html');
const { render } = require('../dist/server/entry-server.js');

(async () => {
  // 1. Read
  const template = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

  // 2. Render
  const appHtml = await render('/');
  const html = template.replace('<!--server-outlet-->', appHtml);

  // 3. Write
  fs.writeFileSync(INDEX_HTML_PATH, html);
  console.log('Generated index.html');
  console.log('`npx serve dist/static` to run static server');
})();
