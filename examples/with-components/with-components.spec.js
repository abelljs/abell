/* eslint-disable max-len */
const fs = require('fs');
const path = require('path');

const { expect } = require('chai');
const {
  preTestSetup,
  getSelector
} = require('../../tests/test-utils/test-helpers.js');

describe('examples/with-components', () => {
  before(async () => {
    await preTestSetup('with-components');
  });

  describe('index.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'index.html'));
    });

    it('should render html from <Nav/>', () => {
      expect($('[data-test="nav-component"]').text()).to.not.equal(null);
    });

    it('should render prop passed to Nav component', () => {
      expect($('[data-test="nav-component-prop"]').text()).to.equal('3');
    });

    it('should render data from <Brand/>', () => {
      expect($('[data-test="brand-component"]').text()).to.equal(
        'This is brand component'
      );
    });

    it('should render data from <Footer/>', () => {
      expect($('footer').text()).to.equal('This is Footer');
    });

    it('should add main stylesheet link to head', () => {
      expect($('link[rel="stylesheet"]').attr('href')).to.equal(
        'bundled-css/main.abell.css'
      );
    });

    it('should have inlined CSS in the index page', () => {
      expect(
        $('style')
          .html()
          .replace(/\n|\r|\s/g, '')
      ).to.equal(
        `nav {
        background-color: #000;
        color: #fff;
      }`.replace(/\n|\r|\s/g, '')
      );
    });
  });

  describe('my-first-blog/index.html', () => {
    let $;
    before(() => {
      $ = getSelector(
        path.join(__dirname, 'dist', 'my-first-blog', 'index.html')
      );
    });

    it('should add main stylesheet link to head', () => {
      expect($('link[rel="stylesheet"]').attr('href')).to.equal(
        '../bundled-css/main.abell.css'
      );
    });

    it('should have inlined CSS in the blog page', () => {
      expect(
        $('style')
          .html()
          .replace(/\n|\r|\s/g, '')
      ).to.equal(
        `nav {
        background-color: #000;
        color: #fff;
      }`.replace(/\n|\r|\s/g, '')
      );
    });
  });

  describe('about.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'about.html'));
    });

    it('should have inlined CSS in the about page', () => {
      expect(
        $('style')
          .html()
          .replace(/\n|\r|\s/g, '')
      ).to.equal(
        `nav {
        background-color: #000;
        color: #fff;
      }`.replace(/\n|\r|\s/g, '')
      );
    });
  });

  describe('bundled-css/main.abell.css', () => {
    it('should have expected CSS properties in main bundle', () => {
      expect(
        fs
          .readFileSync(
            path.join(__dirname, 'dist', 'bundled-css', 'main.abell.css'),
            'utf-8'
          )
          .replace(/\s|\n|\r/g, '')
      ).to.equal(
        `
        footer {
          color: #f30;
        }

        .about {
          color: #999;
        }
      `.replace(/\s|\n|\r/g, '')
      );
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
      ).to.equal(
        `document.querySelector('div.brand').innerHTML = 'Set from JS';`.replace(
          /\s|\n|\r/g,
          ''
        )
      );
    });
  });
});
