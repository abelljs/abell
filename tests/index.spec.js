const expect = require('chai').expect;
const main = require('../src/index.js');

describe('main()', () => {
  it('should export neccessary functions', () => {
    expect(Object.keys(main)).to.have.members([
      'build',
      'generateSite',
      'createHTMLFile'
    ]);
  });
});
