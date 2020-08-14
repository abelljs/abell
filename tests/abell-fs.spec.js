/* eslint-disable max-len */

const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;

const {
  getAbsolutePath,
  replaceExtension,
  getFirstLine,
  rmdirRecursiveSync,
  copyFolderSync,
  createPathIfAbsent,
  recursiveFindFiles
} = require('../src/utils/abell-fs.js');

describe("utils/abell-fs.js - Abell's file system", () => {
  describe('#getAbsolutePath()', () => {
    it('should return absolute path on giving relative path', () => {
      expect(getAbsolutePath(path.join('hi', 'hello'))).to.not.equal(
        path.join('hi', 'hello')
      );
    });
  });

  describe('#replaceExtension()', () => {
    it('should change the extension of given path', () => {
      expect(
        replaceExtension(path.join('hi', 'hello.abell'), '.html')
      ).to.equal(path.join('hi', 'hello.html'));
    });
  });

  describe('#copyFolderSync(), #rmdirRecursiveSync()', () => {
    it('should copy folder from one path to other and then delete it', () => {
      const resourcePath = path.join(__dirname, 'test-utils', 'resources');
      const copyFrom = path.join(resourcePath, 'test_copyFolderSync');
      const copyTo = path.join(resourcePath, 'test_rmdirRecursiveSync');
      copyFolderSync(copyFrom, copyTo, [path.join(copyFrom, 'ignoreme.txt')]);

      expect(fs.existsSync(copyTo)).to.equal(true);
      expect(fs.readdirSync(copyTo)).to.eql(['deepcheck', 'hello.txt']);

      rmdirRecursiveSync(copyTo);
      expect(fs.existsSync(copyTo)).to.equal(false);
    });
  });

  describe('#getFirstLine()', () => {
    before(() => {
      process.chdir('tests/test-utils/resources/test_demo');
    });

    it('should only read the first line of the given file', async () => {
      expect(getFirstLine(path.join('src', 'index.abell')).trim()).to.equal(
        '<!DOCTYPE html>'
      );
    });

    after(() => {
      process.chdir('../../../..');
    });
  });

  describe('#recursiveFindFiles()', () => {
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

  describe('#createPathIfAbsent()', () => {
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
      process.chdir('../../../..');
    });
  });
});
