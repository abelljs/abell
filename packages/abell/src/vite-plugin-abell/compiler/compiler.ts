/* eslint-disable max-len */
import path from 'path';
import dedent from 'dedent';
import { SourceMapGenerator } from 'source-map';
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

type CompileOutputType = {
  code: string;
  map: SourceMapGenerator;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: any;
};

export function compile(
  abellTemplate: string,
  options: CompileOptions
): CompileOutputType {
  const sourceMap = new SourceMapGenerator({
    file: 'generated.ts',
    sourceRoot: path.join(__dirname, '../../utils/__tests__/test-files')
  });

  const tokens = tokenize<TokenSchemaType>(
    abellTemplate,
    tokenSchema,
    'default'
  );

  const isHTMLPage =
    abellTemplate.includes('<html') && abellTemplate.includes('</html>');
  const isAbellComponent = !isHTMLPage;

  const { declarationBlocks, importBlock, cssBlocks, out, maps } =
    getSyntaxBlocks(tokens, {
      isPage: isHTMLPage
    });

  let htmlOut = out.text;
  if (isAbellComponent) {
    htmlOut = getScopedHTML(htmlOut, cssBlocks, options.filepath);
  }

  const IMPORTS_OFFSET = 2;
  // const DECLARATIONS_OFFSET = {
  //   line: 9 +
  // }

  // // const mapss = [];
  // const importLinesDiff =
  //   maps.importTextMap[maps.importTextMap.length - 1].line! -
  //   maps.importTextMap[0].line!;

  // const DECLARATIONS_OFFSET = {
  //   line: 9 + importLinesDiff,
  //   col: 2
  // };

  // console.dir(maps, { depth: Infinity });

  for (const blockMap of maps.filter((map) => map.type === 'import')) {
    const { start, end } = blockMap;
    if (typeof start?.col !== undefined && typeof start?.line !== undefined) {
      sourceMap.addMapping({
        generated: {
          line: IMPORTS_OFFSET + start.line,
          column: start?.col
        },
        source: 'original.abell',
        original: {
          line: start.line,
          column: start.col
        }
      });
    }

    if (typeof end?.col !== undefined && typeof end?.line !== undefined) {
      sourceMap.addMapping({
        generated: {
          line: IMPORTS_OFFSET + end.line,
          column: end?.col
        },
        source: 'original.abell',
        original: {
          line: end.line,
          column: end.col
        }
      });
    }
  }

  // for (const importTextMapIndex in maps.importTextMap) {
  //   const importTextMapObj = maps.importTextMap[importTextMapIndex];
  //   const idx = Number(importTextMapIndex);

  //   if (importTextMapObj.col && importTextMapObj.line) {
  //     sourceMap.addMapping({
  //       generated: {
  //         line:
  //           idx <= 0
  //             ? IMPORTS_OFFSET
  //             : IMPORTS_OFFSET +
  //               (maps.importTextMap[idx]?.line ?? 0) -
  //               (maps.importTextMap[idx - 1]?.line ?? 0),
  //         column: importTextMapObj.col
  //       },
  //       source: 'original.abell',
  //       original: {
  //         line: importTextMapObj.line,
  //         column: importTextMapObj.col
  //       }
  //     });
  //   }
  // }

  // for (const declarationTextMapIndex in maps.declarationTextMap) {
  //   const declarationTextMapObj =
  //     maps.declarationTextMap[declarationTextMapIndex];
  //   const idx = Number(declarationTextMapIndex);

  //   if (declarationTextMapObj.col && declarationTextMapObj.line) {
  //     sourceMap.addMapping({
  //       generated: {
  //         line:
  //           idx <= 0
  //             ? DECLARATIONS_OFFSET.line
  //             : DECLARATIONS_OFFSET.line +
  //               (maps.declarationTextMap[idx]?.line ?? 0) -
  //               (maps.declarationTextMap[idx - 1]?.line ?? 0),
  //         column: DECLARATIONS_OFFSET.col + declarationTextMapObj.col
  //       },
  //       source: 'original.abell',
  //       original: {
  //         line: declarationTextMapObj.line,
  //         column: declarationTextMapObj.col
  //       }
  //     });
  //   }
  // }

  // console.log(mapss);

  const meta = {
    declarationBlocks,
    importBlock,
    out: {
      blocks: out.blocks,
      text: htmlOut
    },
    cssBlocks,
    maps
  };

  sourceMap.setSourceContent('original.abell', abellTemplate);

  const jsOut = dedent`
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
  `;

  return {
    code: jsOut,
    map: sourceMap,
    meta
  };
}

export default compile;
