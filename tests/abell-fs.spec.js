const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;

const {
  createPathIfAbsent,
  recursiveFindFiles,
  getFirstLine
} = require('../src/utils/abell-fs.js');

describe('recursiveFindFiles()', () => {
  // eslint-disable-next-line max-len
  it('should return paths of all files in test_recursiveFindFiles directory', () => {
    // prettier-ignore
    // eslint-disable-next-line max-len
    expect(recursiveFindFiles('tests/test-utils/resources/test_recursiveFindFiles', '.abell'))
      .to.be.an('array')
      .that.has.members([
        'tests/test-utils/resources/test_recursiveFindFiles/deep/moredeep/jkl.abell',
        'tests/test-utils/resources/test_recursiveFindFiles/ghi.abell',
        'tests/test-utils/resources/test_recursiveFindFiles/one/abc.abell',
        'tests/test-utils/resources/test_recursiveFindFiles/two/def.abell'
      ].map(nonCrossPlatformPaths => 
          nonCrossPlatformPaths.replace(/\//g, path.sep)
        )
      );
  });
});

describe('createPathIfAbsent()', () => {
  before(() => {
    process.chdir('tests/test-utils/resources/test_demo');
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
    process.chdir('../../../..')
  });
});

describe('getFirstLine()', () => {
  before(() => {
    process.chdir('tests/test-utils/resources/test_demo');
  });

  it('should only read the first line of the given file', async () => {
    expect(getFirstLine(path.join('src', 'index.abell')).trim())
      .to.equal('<!DOCTYPE html>')
  })

  after(() => {
    process.chdir('../../../..')
  });
})
