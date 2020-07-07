const path = require('path');

const { expect } = require('chai');
const { preTestSetup, getSelector } = require('../../tests/utils/test-helpers.js')

describe('examples/minimal', () => {
  before(async () => {
    await preTestSetup('minimal');
  })

  describe('index.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'index.html'))
    })

    it('should render executed JavaScript even without content', () => {
      expect($('[data-test="add-value"]').html())
        .to.equal(String(13));
    })

  })
});

