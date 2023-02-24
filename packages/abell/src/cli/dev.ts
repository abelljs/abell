import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import {
  getConfigPath,
  getBasePaths,
  getFilePathFromURL
} from '../utils/internal-utils.js';
import { Route } from '../type-utils';

type DevOptions = {
  port: string;
};

async function dev(serverOptions: DevOptions): Promise<void> {
  const app = express();
  const cwd = process.cwd();
  const configFile = getConfigPath(cwd);
  const { SOURCE_ENTRY_BUILD_PATH, ROOT } = await getBasePaths({
    configFile,
    command: 'dev'
  });

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    configFile
  });

  // use vite's connect instance as middleware
  app.use(vite.middlewares);
  app.use('*', async (req: Request, res: Response) => {
    const url = req.originalUrl;
    const abellFilePath = getFilePathFromURL(url, ROOT);

    const { makeRoutes } = await vite.ssrLoadModule(SOURCE_ENTRY_BUILD_PATH);
    const routes: Route[] = await makeRoutes();

    try {
      const currentRoute = routes.find((route) => route.path === url);
      if (!currentRoute) {
        return res
          .status(404)
          .set({ 'Content-Type': 'text/html' })
          .end('not found');
      }

      const renderedContent: string | undefined = currentRoute.render();
      const html = await vite.transformIndexHtml(
        abellFilePath,
        renderedContent ?? ''
      );

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      // @ts-ignore
    } catch (e: Error) {
      // If an error is caught, let Vite fix the stracktrace so it maps back to
      // your actual source code.
      vite.ssrFixStacktrace(e);
      console.error(e);
      const viteScript = await vite.transformIndexHtml('/', ``);
      res.write(viteScript);
      res.write(
        e.message
          .replace(/\</g, '&lt;')
          .replace(/\>/g, '&gt;')
          .replace(/\n/g, '<br/>')
          .replace(/\t/g, '&nbsp;&nbsp;')
      );
      res.status(500).end();
    }
  });

  app.listen(Number(serverOptions.port), () => {
    console.log(
      `Server listening on port http://localhost:${serverOptions.port}`
    );
  });
}

export default dev;
