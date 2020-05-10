const expect = require('chai').expect;

const { 
  getDirectories,
  getAbellConfigs
} = require('../src/helpers.js');

describe('getDirectories()', () => {
  it('should return folder names in array when called on test directory', () => {
    const ifInputArray = getDirectories('tests/resources/test_getDirectories');
    const shouldOutputArray = ['test1', 'test3'];

    expect(ifInputArray)
      .to.be.an('array')
      .that.has.members(shouldOutputArray);
  });
});

describe('getAbellConfigs()', () => {
  it('should return siteName from abell.config.js', () => {
    process.chdir('tests/resources/test_demo');

    expect(getAbellConfigs().globalMeta.siteName)
      .to.equal('Abell Test Working!');

    process.chdir('../../..');
  });
});
