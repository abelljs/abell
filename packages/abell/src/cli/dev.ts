import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { match } from 'node-match-path';
import {
  getConfigPath,
  getViteBuildInfo,
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
  const {
    SOURCE_ENTRY_BUILD_PATH,
    ROOT,
    serverHeaders
  } = await getViteBuildInfo({
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
    const url = req.baseUrl;
    const abellFilePath = getFilePathFromURL(url, ROOT);
    try {
      const { makeRoutes } = await vite.ssrLoadModule(SOURCE_ENTRY_BUILD_PATH);
      const routes: Route[] = await makeRoutes();

      const currentRoute = routes.find(
        (route) => match(route.path, url).matches
      );
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

      return res
        .status(200)
        .set({
          'Content-Type': 'text/html',
          ...serverHeaders
        })
        .end(html);
    } catch (e) {
      // If an error is caught, let Vite fix the stracktrace so it maps back to
      // your actual source code.
      const error = e as Error;
      const stack = error.stack;
      if (stack) {
        error.stack = vite.ssrRewriteStacktrace(stack);
      }
      console.error(error);
      const viteScript = await vite.transformIndexHtml(abellFilePath, ``);
      const errorHTML = error.message
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\n/g, '<br/>')
        .replace(/\t/g, '&nbsp;&nbsp;');
      return res
        .status(500)
        .set({ 'Content-Type': 'text/html' })
        .end(`${viteScript}${errorHTML}`);
    }
  });

  app.listen(Number(serverOptions.port), () => {
    console.log(
      `Server listening on port http://localhost:${serverOptions.port}`
    );
  });
}

export default dev;
