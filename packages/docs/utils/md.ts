// eslint-disable-next-line camelcase
import { EXPERIMENTAL_md } from 'vite-plugin-md-to-html?server';

export const md = (
  args: TemplateStringsArray,
  highlightStart?: number,
  numOfLinesToHiglight?: number
): string => {
  if (!import.meta.env.SSR) {
    throw new Error('md should not be used on client-side');
  }

  // eslint-disable-next-line new-cap
  const mdHtml = EXPERIMENTAL_md(args).replace(
    / <span class="hljs-attr">data-abell-\w+<\/span>/g,
    ''
  );

  if (!highlightStart) {
    return mdHtml;
  }

  if (!numOfLinesToHiglight) {
    numOfLinesToHiglight = 1;
  }

  // eslint-disable-next-line max-len
  const highlighter = `<div class="hljs-line-highlighter" style="top: ${
    30 * highlightStart - 3
  }px; height: ${30 * numOfLinesToHiglight}px"></div>`;

  return '<div style="position: relative">' + mdHtml + highlighter + '</div>';
};
