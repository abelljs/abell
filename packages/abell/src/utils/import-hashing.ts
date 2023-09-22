/**
 * But hey what is import hashing?
 *
 * Checkout PR description of https://github.com/abelljs/abell/pull/161#issue-1906511077 for more info
 *
 */

import fs from 'fs';
import path from 'path';
import { generateHashFromPath } from '../vite-plugin-abell/compiler/scope-css/generate-hash.js';
import { urlifyPath } from './internal-utils.js';

export const CSS_FETCH_REGEX = /<link.*?href="(.*?)".*?\/?>/g;
export const JS_FETCH_REGEX = /<script.*?src="(.*?)".*?>[ \n]*?<\/script>/g;

export const getCSSLinks = (templatePage: string): string => {
  return Array.from(templatePage.matchAll(CSS_FETCH_REGEX))
    .map((linkMatch) => linkMatch[0])
    .join('\n');
};

export const getJSLinks = (templatePage: string): string => {
  return Array.from(templatePage.matchAll(JS_FETCH_REGEX))
    .map((linkMatch) => linkMatch[0])
    .join('\n');
};

const importTemplatesOutContentMemo: Record<string, string> = {};

/**
 * Returns the previously transformed page.
 *
 * We can copy paste imports from this to our new pages
 */
export const getImportTemplatePage = ({
  ROOT,
  OUTPUT_DIR,
  importTemplatesMemo,
  importsHash
}: {
  ROOT: string;
  OUTPUT_DIR: string;
  importTemplatesMemo: Record<string, { htmlPath: string }>;
  importsHash: string;
}) => {
  const relativeToRootHTMLPath = path.relative(
    ROOT,
    importTemplatesMemo[importsHash].htmlPath
  );
  const distHTMLPath = path.join(OUTPUT_DIR, relativeToRootHTMLPath);
  if (importTemplatesOutContentMemo[distHTMLPath]) {
    return importTemplatesOutContentMemo[distHTMLPath];
  }

  const templatePage = fs.readFileSync(distHTMLPath, 'utf-8');
  if (Object.keys(importTemplatesOutContentMemo).length < 100) {
    importTemplatesOutContentMemo[distHTMLPath] = templatePage;
  }
  return templatePage;
};

export const getImportsHash = ({
  ROOT,
  appHtml,
  htmlPath
}: {
  ROOT: string;
  appHtml: string;
  htmlPath: string;
}): {
  importsStringDump: string;
  importsHash: string;
} => {
  const relativeToRootHTMLPath = path.relative(ROOT, path.dirname(htmlPath));

  // This is dump of all JS and CSS links from page. This (after hashing to smaller string) becomes our unique identifier for import patterns
  const importsStringDump =
    getCSSLinks(appHtml) +
    getJSLinks(appHtml) +
    // we also add directory of file in this dump to generate different hash for files in different directory even if they have same imports
    urlifyPath(relativeToRootHTMLPath);
  const importsHash = generateHashFromPath(importsStringDump);

  return {
    importsStringDump,
    importsHash
  };
};
