/**
 * Tests: src/utils/abell-fs.js
 */

/* eslint-disable max-len */

const fs = require('fs');
const path = require('path');

const {
  getAbsolutePath,
  replaceExtension,
  getFirstLine,
  rmdirRecursiveSync,
  copyFolderSync,
  createPathIfAbsent,
  recursiveFindFiles
} = require('../src/utils/abell-fs.js');

const { resPath } = require('./test-utils/helpers.js');

const demoPath = path.join(__dirname, 'demos');

describe("utils/abell-fs.js - Abell's file system", () => {
  describe('#getAbsolutePath()', () => {
    it('should return absolute path on giving relative path', () => {
      expect(getAbsolutePath(path.join('hi', 'hello'))).not.toBe(
        path.join('hi', 'hello')
      );
    });
  });

  describe('#replaceExtension()', () => {
    it('should change the extension of given path', () => {
      expect(replaceExtension(path.join('hi', 'hello.abell'), '.html')).toBe(
        path.join('hi', 'hello.html')
      );
    });
  });

  describe('#copyFolderSync(), #rmdirRecursiveSync()', () => {
    it('should copy folder from one path to other and then delete it', () => {
      const copyFrom = path.join(demoPath, 'copyFolderSync');
      const copyTo = path.join(demoPath, 'rmdirRecursiveSync');
      copyFolderSync(copyFrom, copyTo, [path.join(copyFrom, 'ignoreme.txt')]);

      expect(fs.existsSync(copyTo)).toBe(true);
      expect(fs.readdirSync(copyTo)).toEqual(['deepcheck', 'hi.txt']);

      rmdirRecursiveSync(copyTo);
      expect(fs.existsSync(copyTo)).toBe(false);
    });
  });

  describe('#getFirstLine()', () => {
    it('should only read the first line of the given file', async () => {
      const testFile = path.join(
        demoPath,
        'build-utils-demo',
        'buildMaps',
        'theme',
        'index.abell'
      );

      expect(getFirstLine(testFile).trim()).toBe('<!DOCTYPE html>');
    });
  });

  describe('#recursiveFindFiles()', () => {
    it('should return paths of all files in recursiveFindFiles dir', () => {
      const testDirectory = path.join(demoPath, 'recursiveFindFiles');

      const filesLs = recursiveFindFiles(
        testDirectory,
        '.abell'
      ).map((filePath) => path.relative(testDirectory, resPath(filePath)));

      const expectedFilesLs = [
        'deep/moredeep/jkl.abell',
        'ghi.abell',
        'one/abc.abell',
        'two/def.abell'
      ].map(resPath);

      expect(filesLs).toEqual(expectedFilesLs);
    });
  });

  describe('#createPathIfAbsent()', () => {
    it('should create /createPathIfAbsent/created/path if it is not present', () => {
      const newPath = path.join(
        demoPath,
        'createPathIfAbsent',
        'created',
        'path'
      );

      createPathIfAbsent(newPath);
      expect(fs.existsSync(newPath)).toBe(true);

      // Deleting newly created path
      fs.rmdirSync(newPath);
      fs.rmdirSync(path.join(newPath, '..'));
      fs.rmdirSync(path.join(newPath, '..', '..'));

      expect(fs.existsSync(path.join(demoPath, 'createPathIfAbsent'))).toBe(
        false
      );
    });
  });
});
