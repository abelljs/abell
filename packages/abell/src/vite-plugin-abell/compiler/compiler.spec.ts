/* eslint-disable max-len */
import path from 'path';
import { describe, test, expect } from 'vitest';
import { compile } from './index';

describe('compile()', () => {
  test('should successfully compile single expressions', () => {
    const out = compile('<body>{{ 3 + 4 }}</body>', {
      filepath: __dirname,
      outputType: 'syntax-blocks'
    });
    expect(out.out.text).toMatchInlineSnapshot(
      '"<body data-abell-heumYD>${e( 3 + 4 )}</body>"'
    );
    expect(out.declarationsBlock.text).toMatchInlineSnapshot('""');
  });

  test('should successfully compile with declarations', () => {
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
    expect(out.declarationsBlock.text).toMatchInlineSnapshot(`
      "
            import fs from 'fs';
            import path from 'path';
            import { compile } from 'abell-renderer';
          "
    `);
    expect(out.out.text.trim()).toMatchInlineSnapshot(`
      "<body data-abell-heumYD>
            \${e( 3 + 4 )}
            <b data-abell-heumYD>\${e( 'Helloo'.toUpperCase() )}</b>
          </body>"
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
      filepath: path.join(process.cwd(), 'test.abell'),
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
      filepath: path.join(process.cwd(), 'test.abell'),
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
      filepath: path.join(process.cwd(), 'test.abell'),
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
