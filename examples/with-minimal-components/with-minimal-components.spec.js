/* eslint-disable max-len */
const fs = require('fs');
const path = require('path');

const { preTestSetup } = require('../../tests/test-utils/helpers.js');

describe('examples/with-components', () => {
  beforeAll(async () => {
    await preTestSetup('with-minimal-components');
  });

  describe('index.html', () => {
    it('should have default script import injected by abell', () => {
      const indexHTML = fs.readFileSync(
        path.join(__dirname, 'dist', 'index.html'),
        'utf-8'
      );

      expect(indexHTML).toContain(
        `<script src="bundled-js${path.sep}nav.js"></script>`
      );
    });
  });

  describe('about.html', () => {
    it('should have custom script import', () => {
      const aboutHTML = fs.readFileSync(
        path.join(__dirname, 'dist', 'about.html'),
        'utf-8'
      );

      expect(aboutHTML).toContain(
        `<script defer src="bundled-js/nav.js"></script>`
      );
    });
  });
});
