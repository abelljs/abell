/* eslint-disable max-len */
import { StyleTagAttributes } from '../../type-utils';
import tokenize from './generic-tokenizer';
import { getScopedHTML } from './scope-css';
import { getSyntaxBlocks } from './syntax-blocks';
import { tokenSchema, TokenSchemaType } from './token-schema';

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

type HTMLDeclarationObjectType = {
  declarationsBlock: { text: string };
  cssBlocks: { text: string; attributes: StyleTagAttributes }[];
  out: {
    blocks: { text: string }[];
    text: string;
  };
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
  const tokens = tokenize<TokenSchemaType>(
    abellTemplate,
    tokenSchema,
    'default'
  );

  const isHTMLPage =
    abellTemplate.includes('<html') && abellTemplate.includes('</html>');
  const isAbellComponent = !isHTMLPage;

  const { declarationsBlock, cssBlocks, out } = getSyntaxBlocks(tokens, {
    isPage: isHTMLPage
  });

  let htmlOut = out.text;
  if (isAbellComponent) {
    htmlOut = getScopedHTML(htmlOut, cssBlocks, options.filepath);
  }

  if (options.outputType === 'syntax-blocks') {
    return {
      declarationsBlock,
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
  ${declarationsBlock.text}
  const __filename = ${JSON.stringify(options.filepath)};
  const __dirname = _path.dirname(__filename);
  export const html = (props = {}) => {
    const Abell = { props, __filename, __dirname };
    return \`${htmlOut}\`
  };
  export default html;
  `.trim();

  return jsOut;
}

export default compile;
