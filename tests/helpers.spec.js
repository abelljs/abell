const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;

const {
  getDirectories,
  getAbellConfigs,
  createPathIfAbsent
} = require('../src/helpers.js');

describe('getDirectories()', () => {
  it('should return folder name in array when called on test directory', () => {
    const ifInputArray = getDirectories('tests/resources/test_getDirectories');
    const shouldOutputArray = ['test1', 'test3'];

    // prettier-ignore
    expect(ifInputArray)
      .to.be.an('array')
      .that.has.members(shouldOutputArray);
  });
});

describe('getAbellConfigs()', () => {
  before(() => {
    process.chdir('tests/resources/test_demo');
  });

  it('should return siteName from abell.config.js', () => {
    // prettier-ignore
    expect(getAbellConfigs().globalMeta.siteName)
      .to.equal('Abell Test Working!');
  });

  after(() => {
    process.chdir('../../..');
  });
});

describe('createPathIfAbsent()', () => {
  before(() => {
    process.chdir('tests/resources/test_demo');
  });

  it('should create /newly/created/path if it is not present', () => {
    const newPath = path.join(process.cwd(), 'newly', 'created', 'path');
    createPathIfAbsent(newPath);
    expect(fs.existsSync(newPath)).to.equal(true);
    // Deleting newly created path
    fs.rmdirSync(newPath);
    fs.rmdirSync(path.join(newPath, '..'));
    fs.rmdirSync(path.join(newPath, '..', '..'));
  });

  after(() => {
    process.chdir('../../..');
  });
});
