import { compile } from './index';

describe('compile()', () => {
  test('should successfully compile single expressions', () => {
    const out = compile('<body>{{ 3 + 4 }}</body>');
    expect(out).toMatchSnapshot();
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
      <div>
        {{
          [1, 2, 3].map(i => 
            i * 2
          )
        }}
      </div>
    </body>
    `;
    const out = compile(abellCode);
    expect(out).toMatchSnapshot();
  });
});
