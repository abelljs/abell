/* eslint-disable max-len */
import { describe, test, expect } from 'vitest';
import { compile } from './index';

describe('compile()', () => {
  test('should successfully compile single expressions', () => {
    const out = compile('<body>{{ 3 + 4 }}</body>', {
      filepath: __dirname,
      outputType: 'html-declaration-object'
    });
    expect(out.html).toMatchInlineSnapshot('"<body>${e( 3 + 4 )}</body>"');
    expect(out.declarations).toMatchInlineSnapshot('""');
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
      outputType: 'html-declaration-object'
    });
    expect(out.declarations).toMatchInlineSnapshot(`
      "
            import fs from 'fs';
            import path from 'path';
            import { compile } from 'abell-renderer';
          "
    `);
    expect(out.html.trim()).toMatchInlineSnapshot(`
      "<body>
            \${e( 3 + 4 )}
            <b>\${e( 'Helloo'.toUpperCase() )}</b>
          </body>"
    `);
  });

  test('dev-server', () => {
    const abellCode = `
    <nav>hello</nav>

    <style export>
    nav {
      color: red;
    }
    </style>
    `;

    const out = compile(abellCode, {
      filepath: __dirname
    });

    expect(1).toBe(1);
  });
});
