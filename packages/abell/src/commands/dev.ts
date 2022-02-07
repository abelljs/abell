import path from 'path';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { getPaths } from '../utils/constants';

const isProd = process.env.NODE_ENV === 'production';

type ServeOptions = {
  port?: number;
  ignorePlugins?: boolean;
  printIp?: boolean;
};

async function createServer(serverOptions: ServeOptions = { port: 3000 }) {
  const app = express();
  const cwd = process.cwd();
  const { SOURCE_DIR, ASSETS_DIR, ENTRY_BUILD_PATH } = getPaths({
    env: 'development',
    cwd
  });
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

  app.use('*', async (req: Request, res: Response) => {
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
      // @ts-ignore
    } catch (e: Error) {
      // If an error is caught, let Vite fix the stracktrace so it maps back to
      // your actual source code.
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(serverOptions.port, () => {
    console.log(
      `Server listening on port http://localhost:${serverOptions.port}`
    );
  });
}

function serve(command: ServeOptions): void {
  createServer(command);
}

export default serve;
