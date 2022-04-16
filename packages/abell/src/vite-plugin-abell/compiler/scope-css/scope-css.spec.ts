import { describe, expect, test } from 'vitest';
import { generateHashFromPath } from './generate-hash';
import { getScopedCSS, injectCSSHashToHTML } from './index';

describe('getScopedCSS', () => {
  test('should return scoped css for given hash', () => {
    const css = `
    nav {
      color: red;
    }
    @media screen {
      .hello {
        background-color: white;
      }
    }
    `;

    const randomHash = '123';
    expect(getScopedCSS(css, randomHash)).toMatchInlineSnapshot(
      // eslint-disable-next-line max-len
      '"nav[data-abell-123]{color:red;}@media screen{.hello[data-abell-123]{background-color:white;}}"'
    );
  });
});

describe('injectCSSHashToHTML', () => {
  test('should inject hash into every HTML tag', () => {
    const html = `
    <nav>
      <ul>
        <li>hello</li>
        <li>hi</li>
      </ul>
    </nav>
    `;

    const randomHash = '123';
    expect(injectCSSHashToHTML(html, randomHash)).toMatchInlineSnapshot(`
      "
          <nav data-abell-123>
            <ul data-abell-123>
              <li data-abell-123>hello</li>
              <li data-abell-123>hi</li>
            </ul>
          </nav>
          "
    `);
  });
});

describe('generateHashFromPath', () => {
  test('should generate stable hash', () => {
    expect(generateHashFromPath('/hi/hello')).toBe('eNrfhk');
  });

  test('should normalize path while creating hash', () => {
    expect(generateHashFromPath('/hi/hello')).toBe(
      generateHashFromPath('\\hi\\hello')
    );
  });
});
