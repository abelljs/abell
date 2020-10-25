/**
 * Tests ./packageJSON.json
 */

const packageJSON = require('../package.json');

describe('Deploy Check', () => {
  describe('Package Basic Details', () => {
    it('should have name abell', () => {
      expect(packageJSON.name).toBe('abell');
    });

    it('should not upgrade major version', () => {
      // To avoid unknowingly bumping major version
      const majorVer = packageJSON.version.split('.')[0];
      expect(majorVer).toBe('0');
    });
  });

  describe('Entry Points', () => {
    it('should have main pointing to src/index.js', () => {
      expect(packageJSON.main).toBe('src/index.js');
    });

    it('should have bin pointing to bin/abell.js', () => {
      expect(packageJSON.bin.abell).toBe('bin/abell.js');
    });
  });

  describe('Check Dependencies', () => {
    it('should have expected dependencies', () => {
      expect(Object.keys(packageJSON.dependencies)).toEqual([
        'abell-renderer',
        'chokidar',
        'commander',
        'remarkable',
        'ws'
      ]);
    });
  });
});
