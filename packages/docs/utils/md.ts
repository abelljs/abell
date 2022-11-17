// eslint-disable-next-line camelcase
import { EXPERIMENTAL_md } from 'vite-plugin-md-to-html';

export const md = (args: TemplateStringsArray): string => {
  if (!import.meta.env.SSR) {
    throw new Error('md should not be used on client-side');
  }

  // eslint-disable-next-line new-cap
  return EXPERIMENTAL_md(args).replace(
    / <span class="hljs-attr">data-abell-\w+<\/span>/g,
    ''
  );
};
