const path = require('path');

const { expect } = require('chai');
const { preTestSetup, getSelector } = require('../../tests/utils/test-helpers.js')

describe('examples/main', () => {
  before(async () => {
    await preTestSetup('main');
  })

  describe('index.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'index.html'))
    })

    it('should render executed JavaScript', () => {
      expect($('[data-test="js-in-abell-test"]').html())
        .to.equal(String(11));
    })

    it('should render required text from JSON', () => {
      expect($('[data-test="include-from-json-test"]').html())
        .to.equal('hi I am from JSON');
    })

    it('should render value from abell.config.js globalMeta', () => {
      expect($('[data-test="globalmeta-test"]').html())
        .to.equal('Abell standard example');
    })

    it('should render nothing since the file is at top level', () => {
      expect($('[data-test="root-test"]').html())
        .to.equal('');
    })

    it('should render all the article meta info into container', () => {
      const expectedTitles = [
        `sub-blog (new-blog${path.sep}sub-blog)`,
        'new-blog (new-blog)',
        'My First Blog (my-first-blog)',
        'Another blog (another-blog)',
      ]

      $('[data-test="contentarray-container"] > div').each(function(index, element) {
        expect($(this).children('span.data-title').html())
          .to.equal(expectedTitles[index]);
      })
    })
  })
});

