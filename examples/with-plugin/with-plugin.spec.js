const fs = require('fs');
const path = require('path');

const { expect } = require('chai');
const { preTestSetup, getSelector } = require('../../tests/test-utils/test-helpers.js')

describe('examples/with-plugin', () => {
  before(async () => {
    await preTestSetup('with-plugin');
  })

  describe('index.html', () => {
    let $ = {};
    before(() => {
      $.index = getSelector(path.join(__dirname, 'dist', 'index.html'));
      $.content = getSelector(path.join(__dirname, 'dist', 'hello-custom-blog', 'index.html'))
    })

    it('should have a hello-custom-blog folder', () => {
      expect(fs.existsSync(path.join(__dirname, 'dist', 'hello-custom-blog')))
        .to.equal(true)
    })

    it('should render slug of blog from plugin into the div', () => {
      expect($.index('[data-test="meta-slug"]').html())
        .to.equal('hello-custom-blog');
    })

    it('should render h1 of blog from content into the output html', () => {
      expect($.content('[data-test="blog-content"] > #hello').html())
        .to.equal('Hello');
    })

  })
});

