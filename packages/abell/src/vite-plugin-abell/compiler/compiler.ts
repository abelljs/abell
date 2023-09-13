/* eslint-disable max-len */
import { AbstractSyntaxArrayType } from '../../type-utils.js';
import tokenize from './generic-tokenizer.js';
import { getScopedHTML } from './scope-css/index.js';
import { getSyntaxBlocks } from './syntax-blocks.js';
import { tokenSchema, TokenSchemaType } from './token-schema.js';

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
  outputType?: 'js-string' | 'syntax-blocks';
}

interface HTMLOutputCompileOptions extends CompileOptions {
  outputType: 'syntax-blocks';
}

interface JSOutputCompileOptions extends CompileOptions {
  outputType?: 'js-string';
}

type CompileOutputType = string | AbstractSyntaxArrayType;

export function compile(
  abellTemplate: string,
  options: HTMLOutputCompileOptions
): AbstractSyntaxArrayType;
export function compile(
  abellTemplate: string,
  options: JSOutputCompileOptions
): string;
export function compile(
  abellTemplate: string,
  options: CompileOptions
): CompileOutputType {
  const tokens = tokenize<TokenSchemaType>(
    abellTemplate,
    tokenSchema,
    'default'
  );

  const isHTMLPage =
    abellTemplate.includes('<html') && abellTemplate.includes('</html>');
  const isAbellComponent = !isHTMLPage;

  const { declarationBlocks, importBlock, cssBlocks, out } = getSyntaxBlocks(
    tokens,
    {
      isPage: isHTMLPage
    }
  );

  let htmlOut = out.text;
  if (isAbellComponent) {
    htmlOut = getScopedHTML(htmlOut, cssBlocks, options.filepath);
  }

  if (options.outputType === 'syntax-blocks') {
    return {
      declarationBlocks,
      importBlock,
      out: {
        blocks: out.blocks,
        text: htmlOut
      },
      cssBlocks
    };
  }

  const jsOut = `
  import { default as _path } from 'path';
  import { evaluateAbellBlock as e } from 'abell';
  ${importBlock.text}
  const __filename = ${JSON.stringify(options.filepath)};
  const __dirname = _path.dirname(__filename);
  const root = _path.relative(__dirname, ${JSON.stringify(options.cwd)})
  export const html = (props = {}) => {
    const Abell = { props, __filename, __dirname };
    ${declarationBlocks.text}
    return \`${htmlOut}\`
  };
  export default html;
  `.trim();

  return jsOut;
}

export default compile;
