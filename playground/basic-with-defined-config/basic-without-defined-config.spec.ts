/* eslint-disable max-len */
import { describe, test, expect } from 'vitest';
import index from './index.abell';

describe('basic-with-defined-config', () => {
  test('should return expected html from index', () => {
    expect(index()).toMatchInlineSnapshot(`
      "
      <html>
      <head>
      <style>
      body {
        background-color: tomato;
      }
      </style>
      </head>
      <body>
        <style abell-generated>ul[data-abell-cbPsbg]{background-color:#eee;}</style><nav data-abell-cbPsbg>
        <ul data-abell-cbPsbg>
          <li data-abell-cbPsbg><a href=\\"/\\" data-abell-cbPsbg>Nav Home</a></li>
          <li data-abell-cbPsbg><a href=\\"/about\\" data-abell-cbPsbg>Nav About</a></li>
        </ul>
      </nav>


        <ul class=\\"outer-ul\\">
          <li>Outer Li</li>
        </ul>
        <style abell-generated>ul[data-abell-bEhTBR]{background-color:red;color:white;}</style><footer data-abell-bEhTBR>
        <ul data-abell-bEhTBR>
          <li data-abell-bEhTBR><a href=\\"/\\" data-abell-bEhTBR>Footer Home</a></li>
          <li data-abell-bEhTBR><a href=\\"/about\\" data-abell-bEhTBR>Footer About</a></li>
        </ul>
      </footer>


        <script src=\\"./hello.ts\\" type=\\"module\\"></script>
      </body>
      </html>"
    `);
  });
});
