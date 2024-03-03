import { isDeclarationBlock, isImportBlock, parseAttributes } from './utils.js';
import { Token } from './generic-tokenizer.js';
import { AbstractSyntaxArrayType, MapsObject } from '../../type-utils.js';
import { TokenSchemaType } from './token-schema.js';

export const getSyntaxBlocks = (
  tokens: Token<TokenSchemaType>[],
  { isPage }: { isPage: boolean }
): AbstractSyntaxArrayType => {
  const blockState = {
    isInsideAbellBlock: false,
    abellNestedBlockLevelCount: 0,
    isInsideCSSBlock: false,
    blockCount: 0,
    cssAttributes: {} as Record<string, string | boolean>
  };

  const texts = {
    importText: '',
    declarationText: '',
    abellText: '',
    cssText: '',
    outText: ''
  };

  const maps: MapsObject = {
    importTextMap: [],
    declarationTextMap: [],
    abellTextMap: []
  };

  const cssBlocks = [];
  const outBlocks: { text: string }[] = [];

  const addToHTML = (tokenText: string): void => {
    outBlocks.push({
      text: tokenText
    });

    texts.outText += tokenText;
  };

  for (const token of tokens) {
    if (token.type === 'BLOCK_START') {
      /**
       * Abell Block Start
       *
       * Token: `{{`
       */
      if (blockState.isInsideAbellBlock) {
        // We're already inside abell block so this is a nested block.
        texts.abellText += token.text;
        blockState.abellNestedBlockLevelCount++;
        continue;
      }
      blockState.isInsideAbellBlock = true;
      blockState.blockCount++;
      maps.abellTextMap = [
        { pos: token.pos, col: token.col, line: token.line }
      ];
    } else if (token.type === 'BLOCK_END') {
      /**
       * Abell Block End
       *
       * Token: `}}`
       */

      if (blockState.abellNestedBlockLevelCount > 0) {
        texts.abellText += token.text;
        blockState.abellNestedBlockLevelCount--;
        continue;
      }

      if (!blockState.isInsideAbellBlock) {
        addToHTML(token.text);
        continue;
      }

      if (isImportBlock(blockState.blockCount, texts.abellText)) {
        texts.importText = texts.abellText;
        maps.importTextMap = [
          ...maps.abellTextMap,
          { pos: token.pos, col: token.col, line: token.line }
        ];
        maps.abellTextMap = [];
      } else if (isDeclarationBlock(texts.abellText)) {
        texts.declarationText = texts.abellText;
        maps.declarationTextMap = [
          ...maps.abellTextMap,
          { pos: token.pos, col: token.col, line: token.line }
        ];
        maps.abellTextMap = [];
      } else {
        if (blockState.isInsideCSSBlock) {
          texts.cssText += `\${e(${texts.abellText})}`;
        } else {
          addToHTML(`\${e(${texts.abellText})}`);
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
        addToHTML(token.text);
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
        addToHTML(token.text);
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
        addToHTML(token.text);
      }
    }
  }

  /**
   * @TODO
   * - Return htmlText from this as well to avoid looping through syntax again
   */
  return {
    declarationBlocks: {
      text: texts.declarationText
    },
    importBlock: {
      text: texts.importText
    },
    cssBlocks,
    out: {
      text: texts.outText,
      blocks: outBlocks
    },
    maps
  };
};
