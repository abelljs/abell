/**
 * Tests: /src/index.js
 */

const main = require('../src/index.js');

describe('main()', () => {
  it('should export neccessary functions', () => {
    expect(Object.keys(main)).toEqual([
      'build',
      'serve',
      'generateSite',
      'createHTMLFile'
    ]);
  });
});
