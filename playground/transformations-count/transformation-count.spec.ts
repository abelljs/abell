/* eslint-disable max-len */
import { describe, test, expect, beforeAll } from 'vitest';
import { run, getDocument } from '../test-utils';

describe('basic', () => {
  let terminalOutput = '';
  beforeAll(async () => {
    terminalOutput = await run(__dirname, 'pipe');
  });

  test('should have 2 transformation for this project', () => {
    expect(terminalOutput).toContain(
      'Created 2 files with optimized transformations'
    );
  });

  test('index.html', () => {
    const container = getDocument('index.html');
    expect(container.querySelector('html')?.outerHTML).toMatchInlineSnapshot(`
      "<html><head></head><body>
        hello from index page


      </body></html>"
    `);
  });

  // The transformed file
  test('about-1.html', () => {
    const container = getDocument('about-1.html');
    expect(container.querySelector('html')?.outerHTML).toMatchInlineSnapshot(`
      "<html><head>
        
        <script type=\\"module\\" crossorigin=\\"\\" src=\\"/assets/about-1-302b396f.js\\"></script>
        <link rel=\\"stylesheet\\" href=\\"/assets/about-1-6d606818.css\\">
      </head>

      <body>
        Hello from About Page
        



      </body></html>"
    `);
  });

  // The non-transformed file
  test('about-2.html', () => {
    const container = getDocument('about-2.html');
    expect(container.querySelector('html')?.outerHTML).toMatchInlineSnapshot(`
      "<html><head>
        
      <link rel=\\"stylesheet\\" href=\\"/assets/about-1-6d606818.css\\"></head>

      <body>
        Hello from About Page
        
      <script type=\\"module\\" crossorigin=\\"\\" src=\\"/assets/about-1-302b396f.js\\"></script>


      </body></html>"
    `);
  });
});
