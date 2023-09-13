/* eslint-disable max-len */
import path from 'path';
import { describe, test, expect, vi, beforeAll, afterAll } from 'vitest';
import { compile } from './index';

const consistentPathJoin = (...args: string[]): string => {
  return path.join(...args);
};

beforeAll(() => {
  vi.spyOn(process, 'cwd').mockImplementation(() => '/');
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('compile()', () => {
  test('should successfully compile single expressions', () => {
    const out = compile('<body>{{ 3 + 4 }}</body>', {
      filepath: __dirname,
      outputType: 'syntax-blocks'
    });
    expect(out.out.text).toMatchInlineSnapshot('"<body>${e( 3 + 4 )}</body>"');
    expect(out.declarationBlocks.text).toMatchInlineSnapshot('""');
  });

  test('should output the correct JS for single expressions', () => {
    const abellCode = `
    <nav>hello</nav>
    `;

    const js = compile(abellCode, {
      filepath: consistentPathJoin(process.cwd(), 'test.abell'),
      cwd: process.cwd()
    });
    expect(js.trim().replace(`\\\\test.abell`, '/test.abell'))
      .toMatchInlineSnapshot(`
      "import { default as _path } from 'path';
        import { evaluateAbellBlock as e } from 'abell';
        
        const __filename = \\"/test.abell\\";
        const __dirname = _path.dirname(__filename);
        const root = _path.relative(__dirname, \\"/\\")
        export const html = (props = {}) => {
          const Abell = { props, __filename, __dirname };
          
          return \`
          <nav>hello</nav>
          \`
        };
        export default html;"
    `);
  });

  test('should create first block as declaration block with declarations comment', () => {
    const abellCode = `
    {{
      /** @declarations */
      const a = 3;
    }}
    <body>{{ a }}</body>
    `;
    const out = compile(abellCode, {
      filepath: __dirname,
      outputType: 'syntax-blocks'
    });
    expect(out.out.text.trim()).toMatchInlineSnapshot(
      '"<body>${e( a )}</body>"'
    );
    expect(out.declarationBlocks.text.trim()).toMatchInlineSnapshot(`
      "/** @declarations */
            const a = 3;"
    `);
  });

  test('should place declarations and imports at correct places', () => {
    const abellCode = `
    {{
      import x from './x';
    }}

    <b>{{ 3 + 4 }}</b>
    {{
      /** @declarations */
      const x = 999;
    }}
    <nav>{{ x * 2 }}</nav>
    `;

    const js = compile(abellCode, {
      filepath: consistentPathJoin(process.cwd(), 'test.abell'),
      cwd: process.cwd()
    });
    expect(js.trim().replace(`\\\\test.abell`, '/test.abell'))
      .toMatchInlineSnapshot(`
      "import { default as _path } from 'path';
        import { evaluateAbellBlock as e } from 'abell';
        
            import x from './x';
          
        const __filename = \\"/test.abell\\";
        const __dirname = _path.dirname(__filename);
        const root = _path.relative(__dirname, \\"/\\")
        export const html = (props = {}) => {
          const Abell = { props, __filename, __dirname };
          
            /** @declarations */
            const x = 999;
          
          return \`
          

          <b>\${e( 3 + 4 )}</b>
          
          <nav>\${e( x * 2 )}</nav>
          \`
        };
        export default html;"
    `);
  });

  test('should successfully compile with imports', () => {
    const abellCode = `
    {{
      import fs from 'fs';
      import path from 'path';
      import { compile } from 'abell-renderer';
    }}
    <body>
      {{ 3 + 4 }}
      <b>{{ 'Helloo'.toUpperCase() }}</b>
    </body>
    `;
    const out = compile(abellCode, {
      filepath: __dirname,
      outputType: 'syntax-blocks'
    });
    expect(out.importBlock.text).toMatchInlineSnapshot(`
      "
            import fs from 'fs';
            import path from 'path';
            import { compile } from 'abell-renderer';
          "
    `);
    expect(out.out.text.trim()).toMatchInlineSnapshot(`
      "<body>
            \${e( 3 + 4 )}
            <b>\${e( 'Helloo'.toUpperCase() )}</b>
          </body>"
    `);
  });

  test('should ignore the nested abell blocks', () => {
    const abellCode = `
    <body>
      Evaulation Block: {{ 3 + 4 }}
      Evaluation Block with Nesting: {{ 'start-{{ 2 + 1 }}-end' }}
      Evaluation Block with Nesting: {{ 'start-{{ {{ 2 + 1 }} }}-end' }}
      Escaped Block: \\{{ 2 + 1 }}
    </body>
    `;
    const out = compile(abellCode, {
      filepath: __dirname,
      outputType: 'syntax-blocks'
    });
    expect(out.out.text).toMatchInlineSnapshot(`
      "
          <body>
            Evaulation Block: \${e( 3 + 4 )}
            Evaluation Block with Nesting: \${e( 'start-{{ 2 + 1 }}-end' )}
            Evaluation Block with Nesting: \${e( 'start-{{ {{ 2 + 1 }} }}-end' )}
            Escaped Block: \\\\{{ 2 + 1 }}
          </body>
          "
    `);
  });
});

describe('scoped css', () => {
  test('should scope the css', () => {
    const abellCode = `
    <nav>hello</nav>

    <style export>
    nav {
      color: yellow;
    }
    </style>

    <style hello="hi">
    nav {
      color: blue;
    }
    </style>

    <style scoped="false">
    nav {
      color: red;
    }
    </style>
    `;

    const { out } = compile(abellCode, {
      filepath: consistentPathJoin(process.cwd(), 'test.abell'),
      outputType: 'syntax-blocks'
    });
    expect(out.text.trim()).toMatchInlineSnapshot(`
      "<style abell-generated>nav[data-abell-duqnjx]{color:yellow;}</style><style abell-generated>nav[data-abell-duqnjx]{color:blue;}</style><style abell-ignored>
          nav {
            color: red;
          }
          </style>
          <nav data-abell-duqnjx>hello</nav>"
    `);
  });

  test.skip('should scope the css when HTML is broken', () => {
    const abellCode = `
    {{ '<' + 'nav' + '>' + 'yo</nav>' }}
    <nav>hello</nav>
    <style>
    nav {
      color: yellow;
    }
    </style>
    `;

    const { out } = compile(abellCode, {
      filepath: consistentPathJoin(process.cwd(), 'test.abell'),
      outputType: 'syntax-blocks'
    });

    // This will pass right now because the snapshot is as per the current code,
    // but ideally it should add abell scope css token to generated HTML as well.
    expect(out.text.trim()).toMatchInlineSnapshot(`
      "<style abell-generated>nav[data-abell-duqnjx]{color:yellow;}</style>
          \${e( '<' + 'nav' + '>' + 'yo</nav>' )}
          <nav data-abell-duqnjx>hello</nav>"
    `);
  });

  test('should not scope the css on html page', () => {
    const abellCode = `
    <html>
    <head>
    <style>
    nav {
      color: yellow;
    }
    </style>
    </head>
    <body>
      <nav>hello</nav>
    </body>
    </html>
    `;

    const { out } = compile(abellCode, {
      filepath: consistentPathJoin(process.cwd(), 'test.abell'),
      outputType: 'syntax-blocks'
    });
    expect(out.text.trim()).toMatchInlineSnapshot(`
      "<html>
          <head>
          <style>
          nav {
            color: yellow;
          }
          </style>
          </head>
          <body>
            <nav>hello</nav>
          </body>
          </html>"
    `);
  });

  test('should not scope the css when there are no style tags', () => {
    const abellCode = `
    <nav>hello</nav>
    `;

    const { out } = compile(abellCode, {
      filepath: consistentPathJoin(process.cwd(), 'test.abell'),
      outputType: 'syntax-blocks'
    });
    expect(out.text.trim()).toMatchInlineSnapshot('"<nav>hello</nav>"');
  });

  test('should not scope the css when there are no scoped style tags', () => {
    const abellCode = `
    <nav>hello</nav>
    <style scoped="false">
    nav {
      color: red;
    }
    </style>
    `;

    const { out } = compile(abellCode, {
      filepath: consistentPathJoin(process.cwd(), 'test.abell'),
      outputType: 'syntax-blocks'
    });

    expect(out.text.trim()).toMatchInlineSnapshot(`
      "<style abell-ignored>
          nav {
            color: red;
          }
          </style>
          <nav>hello</nav>"
    `);
  });

  test('should handle abell blocks inside style tag', () => {
    const abellCode = `
    {{
      import x from '.xyz'
    }}
    <html>
    <head>
    <style>
    {{ 2 + 1 }}
    </style>
    </head>
    <body>
      <nav>hello</nav>
    </body>
    </html>
    `;

    const { out } = compile(abellCode, {
      filepath: consistentPathJoin(process.cwd(), 'test.abell'),
      outputType: 'syntax-blocks'
    });
    expect(out.text.trim()).toMatchInlineSnapshot(`
      "<html>
          <head>
          <style>
          \${e( 2 + 1 )}
          </style>
          </head>
          <body>
            <nav>hello</nav>
          </body>
          </html>"
    `);
  });
});
