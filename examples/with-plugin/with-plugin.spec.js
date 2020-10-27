const fs = require('fs');
const path = require('path');

const {
  preTestSetup,
  getSelector
} = require('../../tests/test-utils/helpers.js');

describe('examples/with-plugin', () => {
  const $ = {};
  beforeAll(async () => {
    await preTestSetup('with-plugin');
    $.index = getSelector(path.join(__dirname, 'dist', 'index.html'));
    $.content = getSelector(
      path.join(__dirname, 'dist', 'hello-custom-blog', 'index.html')
    );
  });

  describe('beforeBuild plugin', () => {
    it('should have a hello-custom-blog folder', () => {
      expect(
        fs.existsSync(path.join(__dirname, 'dist', 'hello-custom-blog'))
      ).toBe(true);
    });

    it('should render h1 of blog from content into the output html', () => {
      expect($.content('[data-test="blog-content"] > #hello').html()).toBe(
        'Hello'
      );
    });
  });

  describe('beforeHTMLWrite plugin', () => {
    it('should add additional css from beforeWriteHTML plugin', () => {
      expect(
        $.index('head > style')
          .html()
          .replace(/\n|\r|\s/g, '')
      ).toBe('body{background-color:green;}');
    });

    it('should render all the slugs of blog', () => {
      expect($.index('[data-test="all-slugs"]').html()).toMatchSnapshot();
    });
  });

  describe('afterBuild plugin', () => {
    it('creates after-build.txt file', () => {
      expect(
        fs.existsSync(path.join(__dirname, 'dist', 'after-build.txt'))
      ).toBe(true);
    });
  });
});
