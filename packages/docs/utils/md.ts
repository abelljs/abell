// eslint-disable-next-line camelcase
import { EXPERIMENTAL_md } from 'vite-plugin-md-to-html?server';

export const md = (args: TemplateStringsArray): string => {
  // eslint-disable-next-line new-cap
  return EXPERIMENTAL_md(args).replace(
    / <span class="hljs-attr">data-abell-\w+<\/span>/g,
    ''
  );
};
