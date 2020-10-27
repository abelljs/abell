const path = require('path');

const {
  preTestSetup,
  getSelector
} = require('../../tests/test-utils/helpers.js');

describe('examples/minimal', () => {
  beforeAll(async () => {
    await preTestSetup('minimal');
  });

  describe('index.html', () => {
    let $;
    beforeAll(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'index.html'));
    });

    it('should render executed JavaScript even without content', () => {
      expect($('[data-test="add-value"]').html()).toBe(String(13));
    });
  });
});
