const expect = require('chai').expect;
const package = require('../package.json');

describe('Deploy Check', () => {
  describe('Package Name', () => {
    it('should have name abell', () => {
      expect(package.name).to.equal('abell');
    });
  });

  describe('Entry Points', () => {
    it('should have main pointing to src/index.js', () => {
      expect(package.main).to.equal('src/index.js');
    });

    it('should have bin pointing to bin/abell.js', () => {
      expect(package.bin.abell).to.equal('bin/abell.js');
    });
  });

  describe('Check Dependencies', () => {
    it('should have expected dependencies', () => {
      expect(Object.keys(package.dependencies)).to.have.members([
        'abell-renderer',
        'chokidar',
        'remarkable',
        'commander',
        'ws'
      ]);
    });
  });
});
