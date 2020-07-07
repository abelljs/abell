const path = require('path');

const { expect } = require('chai');
const { preTestSetup, getSelector } = require('../../tests/utils/test-utils.js')

const TEST_MAP = {
  'index.html': [
    {
      desc: 'should render executed JavaScript even without content',
      query: '[data-cy="add-value"]',
      toEqual: String(13)
    }
  ]
}

describe('examples/minimal', () => {
  before(async () => {
    await preTestSetup('minimal');
  })

  for (const filenameKey in TEST_MAP) {
    describe(`${filenameKey}`, () => {
      let $;
      before(() => {
        $ = getSelector(path.join(__dirname, 'dist', filenameKey))
      })

      for (const test of TEST_MAP[filenameKey]) {
        it(test.desc, () => {
          expect($(test.query).html())
            .to.equal(test.toEqual);
        });
      }
    })
  }
});

