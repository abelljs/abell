const fs = require('fs');
const path = require('path');

const { expect } = require('chai');
const {
  preTestSetup,
  getSelector,
  normalizeString
} = require('../../tests/test-utils/test-helpers.js');

describe('examples/with-single-component', () => {
  before(async () => {
    await preTestSetup('with-single-component');
  });

  describe('index.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'index.html'));
    });

    it('should have link tag added', () => {
      expect($('link[rel="stylesheet"]').attr('href')).to.equal(
        `bundled-css${path.sep}main.abell.css`
      );
    });

    it('should have inlined javascript', () => {
      expect(normalizeString($('script').html())).to.equal(
        normalizeString(`let inlinedTest = ''`)
      );
    });
  });

  describe('bundled-css/main.abell.css', () => {
    it('should have content from both style tags', () => {
      const cssPath = path.join(
        __dirname,
        'dist',
        'bundled-css',
        'main.abell.css'
      );

      expect(fs.existsSync(cssPath)).to.equal(true);

      const expectedCSS = `
        div[data-abell-eEgKSA]{color:#f40;}
        div[data-abell-eEgKSA]{background-color:#f30;}
      `;

      expect(normalizeString(fs.readFileSync(cssPath, 'utf-8'))).to.equal(
        normalizeString(expectedCSS)
      );
    });
  });

  describe('bundled-js/main.abell.js', () => {
    it('should have content from both script tags', () => {
      const mainJSPath = path.join(
        __dirname,
        'dist',
        'bundled-js',
        'main.abell.js'
      );

      expect(fs.existsSync(mainJSPath)).to.equal(true);

      const expectedJS = `
        let fileTest = '' 
        let fileTest2 = ''
      `;
      expect(normalizeString(fs.readFileSync(mainJSPath, 'utf-8'))).to.equal(
        normalizeString(expectedJS)
      );
    });
  });
});
