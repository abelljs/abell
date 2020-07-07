const path = require('path');

const { expect } = require('chai');
const { preTestSetup, getSelector } = require('../../tests/utils/test-utils.js')

const TEST_MAP = {
  'index.html': [
    {
      desc: 'should render executed JavaScript',
      query: '[data-cy="js-in-abell-test"]',
      toEqual: String(11)
    },
    {
      desc: 'should render required text from JSON',
      query: '[data-cy="include-from-json-test"]',
      toEqual: 'hi I am from JSON'
    },
    {
      desc: 'should render value from abell.config.js globalMeta',
      query: '[data-cy="globalmeta-test"]',
      toEqual: 'Abell standard example'
    },
    {
      desc: 'should render nothing since the file is at top level',
      query: '[data-cy="root-test"]',
      toEqual: ''
    },
  ]
}

describe('examples/main', () => {
  before(async () => {
    await preTestSetup('main');
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

