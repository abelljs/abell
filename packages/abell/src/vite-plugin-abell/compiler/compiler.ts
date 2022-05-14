/* eslint-disable max-len */
import path from 'path';
import { isDeclarationBlock, parseAttributes } from './utils';
import tokenize, { Token } from './generic-tokenizer';
import {
  generateHashFromPath,
  getScopedCSS,
  injectCSSHashToHTML
} from './scope-css';

const tokenSchema = {
  ESCAPED_BLOCK_START: /\\{{/,
  STYLE_START: /<style(.*?)>/,
  STYLE_END: /<\/style>/,
  BLOCK_START: /{{/,
  BLOCK_END: /}}/
};

type AbstractSyntaxArrayType = {
  declarations: string;
  cssBlocks: { text: string; attributes: Record<string, string | boolean> }[];
  htmlBlocks: { text: string }[];
};

export const getSyntaxBlocks = (
  tokens: Token<typeof tokenSchema>[],
  { isPage }: { isPage: boolean }
): AbstractSyntaxArrayType => {
  const blockState = {
    isInsideAbellBlock: false,
    isInsideCSSBlock: false,
    blockCount: 0,
    cssAttributes: {} as Record<string, string | boolean>
  };

  const texts = {
    declarationText: '',
    abellText: '',
    cssText: ''
  };

  const cssBlocks = [];
  const htmlBlocks = [];

  for (const token of tokens) {
    if (token.type === 'BLOCK_START') {
      /**
       * Abell Block Start
       *
       * Token: `{{`
       */
      blockState.isInsideAbellBlock = true;
      blockState.blockCount++;
    } else if (token.type === 'BLOCK_END') {
      /**
       * Abell Block End
       *
       * Token: `}}`
       */

      if (!blockState.isInsideAbellBlock) {
        htmlBlocks.push({
          text: token.text
        });
        continue;
      }

      if (isDeclarationBlock(blockState.blockCount, texts.abellText)) {
        texts.declarationText = texts.abellText;
      } else {
        if (blockState.isInsideCSSBlock) {
          texts.cssText += `\${e(${texts.abellText})}`;
        } else {
          htmlBlocks.push({
            text: `\${e(${texts.abellText})}`
          });
        }
      }
      blockState.isInsideAbellBlock = false;
      texts.abellText = '';
    } else if (token.type === 'STYLE_START') {
      /**
       * Style Tag Start
       *
       * Token: `<style>`
       */

      // Treat CSS as plain text in page (no need to scope css)
      if (isPage) {
        htmlBlocks.push({
          text: token.text
        });
        continue;
      }

      blockState.isInsideCSSBlock = true;
      if (token.matches?.[0]) {
        blockState.cssAttributes = parseAttributes(token.matches[0]);
      } else {
        blockState.cssAttributes = {};
      }
    } else if (token.type === 'STYLE_END') {
      /**
       * Style End
       *
       * Token: `</style>`
       */
      if (!blockState.isInsideCSSBlock) {
        htmlBlocks.push({
          text: token.text
        });
        continue;
      }
      cssBlocks.push({
        text: texts.cssText,
        attributes: blockState.cssAttributes
      });
      texts.cssText = '';
      blockState.cssAttributes = {};
      blockState.isInsideCSSBlock = false;
    } else {
      // Rest of the tokens
      if (blockState.isInsideAbellBlock) {
        texts.abellText += token.text;
      } else if (blockState.isInsideCSSBlock) {
        texts.cssText += token.text;
      } else {
        htmlBlocks.push({
          text: token.text
        });
      }
    }
  }

  return {
    declarations: texts.declarationText,
    cssBlocks,
    htmlBlocks
  };
};

/**
 * TODO:
 * CSS Plan-
 *
 * 1. Scope css in the component itself
 * 2. Collect and bundle styles in the plugin (New Vite versions will handle this out of the box)
 *
 */

interface CompileOptions {
  filepath: string;
  cwd?: string;
  outputType?: 'js-string' | 'html-declaration-object';
}

interface HTMLOutputCompileOptions extends CompileOptions {
  outputType: 'html-declaration-object';
}

interface JSOutputCompileOptions extends CompileOptions {
  outputType?: 'js-string';
}

type HTMLDeclarationObjectType = {
  html: string;
  css: string;
  declarations: string;
};

type CompileOutputType = string | HTMLDeclarationObjectType;

export function compile(
  abellTemplate: string,
  options: HTMLOutputCompileOptions
): HTMLDeclarationObjectType;
export function compile(
  abellTemplate: string,
  options: JSOutputCompileOptions
): string;
export function compile(
  abellTemplate: string,
  options: CompileOptions
): CompileOutputType {
  const tokens = tokenize<typeof tokenSchema>(
    abellTemplate,
    tokenSchema,
    'default'
  );

  const isHTMLPage =
    abellTemplate.includes('<html') && abellTemplate.includes('</html>');
  const isAbellComponent = !isHTMLPage;

  const { declarations, cssBlocks, htmlBlocks } = getSyntaxBlocks(tokens, {
    isPage: isHTMLPage
  });

  if (isAbellComponent) {
  }

  //   const isHTMLPage =
  //     htmlCodeBlock.includes('</html>') && htmlCodeBlock.includes('<html');
  //   const relativeFilePath = path.relative(process.cwd(), options.filepath);
  //   const componentHash = generateHashFromPath(relativeFilePath);
  //   if (!isHTMLPage) {
  //     // If not parent HTML Page (it's a component!), inject scope css attributes
  //     htmlCodeBlock = injectCSSHashToHTML(htmlCodeBlock, componentHash);
  //   }

  //   let styleTagsString = '';
  //   for (const cssBlock of cssCollection) {
  //     if (cssBlock.attributes.scoped === 'false' || isHTMLPage) {
  //       styleTagsString += `<style abell-ignored>${cssBlock.text}</style>`;
  //       continue;
  //     }
  //     cssBlock.scopedCSS = getScopedCSS(cssBlock.text, componentHash);
  //     styleTagsString += `<style abell-generated>${cssBlock.scopedCSS}</style>`;
  //   }
  //   htmlCodeBlock = styleTagsString + htmlCodeBlock;

  //   if (options.outputType === 'html-declaration-object') {
  //     return {
  //       html: htmlCodeBlock,
  //       css: cssCodeBlock,
  //       declarations
  //     };
  //   }

  //   const internalUtilsPath = path.join(
  //     __dirname,
  //     '..',
  //     '..',
  //     'utils',
  //     'internal-utils'
  //   );

  //   const jsOut = `
  // import { default as _path } from 'path';
  // import { createRequire } from 'module';
  // const require = createRequire(import.meta.url);
  // const { evaluateAbellBlock: e } = require(${JSON.stringify(internalUtilsPath)});
  // ${declarations}
  // const __filename = ${JSON.stringify(options.filepath)};
  // const __dirname = _path.dirname(__filename);
  // export const html = (props = {}) => {
  //   const Abell = { props, __filename, __dirname };
  //   return \`${htmlCodeBlock}\`
  // };
  // export default html;
  // `.trim();

  //   return jsOut;
}

export default compile;
