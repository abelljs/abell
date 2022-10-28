import { EXPERIMENTAL_md } from 'vite-plugin-md-to-html';

export const md = (args: TemplateStringsArray) => {
  return EXPERIMENTAL_md(args).replace(/ <span class="hljs-attr">data-abell-\w+<\/span>/g, '')
}