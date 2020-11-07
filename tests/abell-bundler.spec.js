/**
 * Tests: src/utils/abell-bundler.js
 */

const fs = require('fs');
const path = require('path');

const abellRenderer = require('abell-renderer');

const {
  clearBundleCache,
  getComponentBundles
} = require('../src/utils/abell-bundler.js');

const { resPath, transformHash } = require('./test-utils/helpers.js');

const demoPath = path.join(__dirname, 'demos');

describe('src/utils/abell-bundler.js', () => {
  it('should clear the bundles from cache', () => {
    const tempObjEntries = Object.entries;

    // mocks the entry values inside function
    Object.entries = jest.fn(() => {
      return [
        ['test-1', ['inlinedStyles-testBundle']],
        ['test-2', ['inlinedScripts-testBundle', 'lalala']]
      ];
    });

    // when bundle is provided
    const newBundle = clearBundleCache({
      ofBundle: 'testBundle'
    });

    const expectedBundle = {
      currentBundledCSS: { 'test-2': ['inlinedScripts-testBundle', 'lalala'] },
      currentBundledJS: {
        'test-1': ['inlinedStyles-testBundle'],
        'test-2': ['lalala']
      }
    };
    expect(newBundle).toEqual(expectedBundle);

    // This is suppose to completely delete the cache
    const cleanBundle = clearBundleCache();
    expect(cleanBundle).toEqual({
      currentBundledCSS: {},
      currentBundledJS: {}
    });
    Object.entries = tempObjEntries;
  });

  it('should return expected bundle of output', () => {
    const entryAbellFile = path.join(
      demoPath,
      'test-example-components',
      'index.abell'
    );

    const { components } = abellRenderer.render(
      fs.readFileSync(entryAbellFile, 'utf-8'),
      {},
      {
        basePath: path.dirname(entryAbellFile),
        allowComponents: true,
        allowRequire: true
      }
    );

    const expectedIndexBundle = Object.entries({
      inlinedStyles: { content: '', path: '' },
      inlinedScripts: { content: '', path: '' },
      [resPath('bundled-css/main.abell.css-0')]: {
        content:
          'nav[data-abell-khwCVZ]{color:#f30;}button[data-abell-iAzCAi]{color:#000;}', // eslint-disable-line max-len
        path: resPath('bundled-css/main.abell.css')
      },
      [resPath('bundled-js/main.abell.js-0')]: {
        content: '{\n  const isNav = true;\n}{\n  const isFooter = true;\n}',
        path: resPath('bundled-js/main.abell.js')
      },
      [resPath('bundled-css/footer.css-0')]: {
        content: 'footer[data-abell-ejvjCJ]{color:#111;}',
        path: resPath('bundled-css/footer.css')
      },
      'inlinedStyles-index.html-1': {
        content: 'footer[data-abell-ejvjCJ]{background-color:#f30;}',
        path: 'inlinedStyles-index.html'
      }
    });

    const indexBundleMap = Object.entries(
      getComponentBundles(components, 'index.html')
    );

    // test keys
    for (let i = 2; i < 6; i++) {
      expect(indexBundleMap[i][0]).toBe(expectedIndexBundle[i][0]);
      expect(transformHash(indexBundleMap[i][1].content)).toBe(
        transformHash(expectedIndexBundle[i][1].content)
      );
      expect(indexBundleMap[i][1].path).toBe(expectedIndexBundle[i][1].path);
    }
  });
});
