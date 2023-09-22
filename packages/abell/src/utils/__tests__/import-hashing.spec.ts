import { test, describe, expect } from 'vitest';
import { getImportsHash } from '../import-hashing';

describe('getImportsHash()', () => {
  test('should generate same hash for 2 templates with same imports', () => {
    const template1 = `
    <html>
    <head>
      <link rel="stylesheet" href="./global.css" />
    </head>
    <body>
      TEMPLATE 1
      <script src="./main.ts"></script>
    </body>
    </html>
    `;

    const template2 = `
    <html>
    <head>
      <link rel="stylesheet" href="./global.css" />
    </head>
    <body>
      TEMPLATE 2
      <script src="./main.ts"></script>
    </body>
    </html>
    `;

    expect(
      getImportsHash({
        ROOT: '/',
        appHtml: template1,
        htmlPath: '/template-1.abell'
      }).importsHash
    ).toBe(
      getImportsHash({
        ROOT: '/',
        appHtml: template2,
        htmlPath: '/template-2.abell'
      }).importsHash
    );
  });

  test('should generate different hash for 2 templates with slightly imports', () => {
    const template1 = `
    <html>
    <head>
      <link rel="stylesheet" href="./global.css" />
    </head>
    <body>
      TEMPLATE 1
    </body>
    </html>
    `;

    const template2 = `
    <html>
    <head>
      <link rel="stylesheet" href="./global.css" />
    </head>
    <body>
      TEMPLATE 2
      <script src="./main.ts"></script>
    </body>
    </html>
    `;

    expect(
      getImportsHash({
        ROOT: '/',
        appHtml: template1,
        htmlPath: '/template-1.abell'
      }).importsHash
    ).not.toBe(
      getImportsHash({
        ROOT: '/',
        appHtml: template2,
        htmlPath: '/template-2.abell'
      }).importsHash
    );

    // same template in 2 different paths should generate different hash as well
    expect(
      getImportsHash({
        ROOT: '/',
        appHtml: template1,
        htmlPath: '/template-1.abell'
      }).importsHash
    ).not.toBe(
      getImportsHash({
        ROOT: '/',
        appHtml: template1,
        htmlPath: '/docs/template-2.abell'
      }).importsHash
    );
  });

  test('should generate expected string dump', () => {
    const template1 = `
    <html>
    <head>
      <link rel="stylesheet" href="./global.css" />
    </head>
    <body>
      TEMPLATE 1
      <script src="./main.ts"></script>
    </body>
    </html>
    `;

    expect(
      getImportsHash({
        ROOT: '/',
        appHtml: template1,
        htmlPath: '/docs/xyz/template-1.abell'
      }).importsStringDump
    ).toMatchInlineSnapshot(
      '"<link rel=\\"stylesheet\\" href=\\"./global.css\\" /><script src=\\"./main.ts\\"></script>docs/xyz"'
    );
  });
});
