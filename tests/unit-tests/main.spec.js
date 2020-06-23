const expect = require('chai').expect;
const main = require('../../src/main.js');

describe('main()', () => {
  it('should export neccessary functions', () => {
    expect(Object.keys(main)).to.have.members([
      'build',
      'serve',
      'generateContentFile',
      'generateHTMLFile'
    ]);
  });
});
