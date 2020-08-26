const fs = require('fs');
const path = require('path');

const { expect } = require('chai');
const {
  preTestSetup,
  getSelector
} = require('../../tests/test-utils/test-helpers.js');

describe('examples/with-plugin', () => {
  before(async () => {
    await preTestSetup('with-plugin');
  });

  describe('index.html', () => {
    const $ = {};
    before(() => {
      $.index = getSelector(path.join(__dirname, 'dist', 'index.html'));
      $.content = getSelector(
        path.join(__dirname, 'dist', 'hello-custom-blog', 'index.html')
      );
    });

    it('should have a hello-custom-blog folder', () => {
      expect(
        fs.existsSync(path.join(__dirname, 'dist', 'hello-custom-blog'))
      ).to.equal(true);
    });

    it('should render h1 of blog from content into the output html', () => {
      expect($.content('[data-test="blog-content"] > #hello').html()).to.equal(
        'Hello'
      );
    });

    it('should add additional css from beforeWriteHTML plugin', () => {
      expect(
        $.index('head > style')
          .html()
          .replace(/\n|\r|\s/g, '')
      ).to.equal('body{background-color:green;}');
    });

    it('should render all the slugs of blog', () => {
      const expectedTitles = [
        'my-first-blog',
        'another-blog',
        'blog-from-plugin',
        'hello-custom-blog'
      ];

      $.index('[data-test="all-slugs"] > div').each(function (index, element) {
        expect($.index(this).children('.meta-slug').html()).to.equal(
          expectedTitles[index]
        );
      });
    });
  });
});
