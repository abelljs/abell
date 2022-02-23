import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { getConfigPath, getBasePaths } from '../utils/internal-utils';

type DevOptions = {
  port: string;
};

async function dev(serverOptions: DevOptions): Promise<void> {
  const app = express();
  const cwd = process.cwd();
  const configFile = getConfigPath(cwd);
  const { SOURCE_ENTRY_BUILD_PATH, PAGES_ROOT } = await getBasePaths({
    cwd
  });

  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' },
    root: PAGES_ROOT,
    configFile
  });
  // use vite's connect instance as middleware
  app.use(vite.middlewares);
  app.use('*', async (req: Request, res: Response) => {
    const url = req.originalUrl;

    try {
      const { render } = await vite.ssrLoadModule(SOURCE_ENTRY_BUILD_PATH);

      // transforms the paths
      const renderedContent: string | undefined = await render(url);
      const html = await vite.transformIndexHtml(url, renderedContent ?? '');

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

  app.listen(Number(serverOptions.port), () => {
    console.log(
      `Server listening on port http://localhost:${serverOptions.port}`
    );
  });
}

export default dev;
