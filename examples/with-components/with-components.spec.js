/* eslint-disable max-len */
const fs = require('fs');
const path = require('path');

const {
  preTestSetup,
  getSelector,
  transformHash
} = require('../../tests/test-utils/helpers.js');

describe('examples/with-components', () => {
  beforeAll(async () => {
    await preTestSetup('with-components');
  });

  describe('index.html', () => {
    let $;
    beforeAll(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'index.html'));
    });

    it('should render html from <Nav/>', () => {
      expect($('[data-test="nav-component"]').html()).toMatchSnapshot();
    });

    it('should render data from <Footer/>', () => {
      expect($('footer').text()).toBe('This is Footer');
    });

    it('should add main stylesheet link to head', () => {
      expect($('link[rel="stylesheet"]').attr('href')).toBe(
        'bundled-css/main.abell.css'.replace(/\//g, path.sep)
      );
    });

    it('should have inlined CSS in the index page', () => {
      expect(transformHash($('style').html())).toMatchSnapshot();
    });
  });

  describe('my-first-blog/index.html', () => {
    let $;
    beforeAll(() => {
      $ = getSelector(
        path.join(__dirname, 'dist', 'my-first-blog', 'index.html')
      );
    });

    it('should add main stylesheet link to head', () => {
      expect($('link[rel="stylesheet"]').attr('href')).toBe(
        '../bundled-css/main.abell.css'.replace(/\//g, path.sep)
      );
    });

    it('should have inlined CSS in the blog page', () => {
      expect(transformHash($('style').html())).toMatchSnapshot();
    });
  });

  describe('about.html', () => {
    let $;
    beforeAll(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'about.html'));
    });

    it('should have inlined CSS in the about page', () => {
      expect(transformHash($('style').html())).toMatchSnapshot();
    });
  });

  describe('bundled-css/main.abell.css', () => {
    it('should have expected CSS properties in main bundle', () => {
      const footerCSS = `
        footer[data-abell-jLzQID] {
          color: #f30;
        }
      `.replace(/\s|\n|\r/g, '');

      const aboutCSS = `
        .about[data-abell-fBMCHA] {
          color: #999;
        }
      `.replace(/\s|\n|\r/g, '');

      const mainAbellCSS = fs
        .readFileSync(
          path.join(__dirname, 'dist', 'bundled-css', 'main.abell.css'),
          'utf-8'
        )
        .replace(/\s|\n|\r/g, '');

      expect(
        mainAbellCSS.includes(footerCSS) && mainAbellCSS.includes(aboutCSS)
      ).toBe(true);
    });
  });

  describe('bundled-js/main.abell.js', () => {
    it('should have expected JS code in main js bundle', () => {
      expect(
        fs
          .readFileSync(
            path.join(__dirname, 'dist', 'bundled-js', 'main.abell.js'),
            'utf-8'
          )
          .replace(/\s|\n|\r/g, '')
      ).toBe(
        `document.querySelector('div.brand').innerHTML = 'Set from JS';`.replace(
          /\s|\n|\r/g,
          ''
        )
      );
    });
  });
});
