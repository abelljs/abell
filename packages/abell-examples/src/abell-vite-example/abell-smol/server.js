const path = require('path');
const express = require('express');
const { createServer: createViteServer } = require('vite');
const {
  ASSETS_DIR,
  SERVER_PORT,
  ENTRY_BUILD_PATH,
  SOURCE_DIR,
  cwd
} = require('./constants');

const isProd = process.env.NODE_ENV === 'production';

async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' },
    root: SOURCE_DIR,
    configFile: path.join(cwd, 'vite.config.ts')
  });
  // use vite's connect instance as middleware
  app.use(vite.middlewares);

  if (isProd) {
    app.use('/assets', express.static(ASSETS_DIR));
  }

  app.use('*', async (req, res) => {
    const url = req.originalUrl;

    try {
      let render;
      if (isProd) {
        ({ render } = require(ENTRY_BUILD_PATH));
      } else {
        ({ render } = await vite.ssrLoadModule(ENTRY_BUILD_PATH));
      }

      // transforms the paths
      const html = await vite.transformIndexHtml(url, await render(url));

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      // If an error is caught, let Vite fix the stracktrace so it maps back to
      // your actual source code.
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(SERVER_PORT, () => {
    console.log(`Server listening on port ${SERVER_PORT}`);
  });
}

createServer();
