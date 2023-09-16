import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import markdown from 'highlight.js/lib/languages/markdown';
import css from 'highlight.js/lib/languages/css';

import { abellHighlighter } from '../utils/abell-syntax-highlighter';
import type { HLJSApi } from 'highlight.js';

// Have to do this on client because we need to pass non-highlighted code to webcontainer first

const registerSyntaxHighlighter = (): HLJSApi => {
  hljs.registerLanguage('ts', typescript);
  hljs.registerLanguage('javascript', typescript);
  hljs.registerLanguage('mdx', markdown);
  hljs.registerLanguage('md', markdown);
  hljs.registerAliases('js', { languageName: 'javascript' });
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('xml', xml);
  hljs.registerLanguage('abell', abellHighlighter);
  hljs.registerLanguage('css', css);

  return hljs;
};

export { registerSyntaxHighlighter };
