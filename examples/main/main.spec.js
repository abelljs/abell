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
      expect($('[data-cy="js-in-abell-test"]').html())
        .to.equal(String(11));
    })

    it('should render required text from JSON', () => {
      expect($('[data-cy="include-from-json-test"]').html())
        .to.equal('hi I am from JSON');
    })

    it('should render value from abell.config.js globalMeta', () => {
      expect($('[data-cy="globalmeta-test"]').html())
        .to.equal('Abell standard example');
    })

    it('should render nothing since the file is at top level', () => {
      expect($('[data-cy="root-test"]').html())
        .to.equal('');
    })
  })
});

