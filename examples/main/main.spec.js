const fs = require('fs');
const path = require('path');

const {
  preTestSetup,
  getSelector
} = require('../../tests/test-utils/helpers.js');

const examplePath = path.join(__dirname, 'dist');

describe('examples/main', () => {
  beforeAll(async () => {
    await preTestSetup('main');
  });

  describe('dist/index.html', () => {
    /** Test dist/index.html */

    let indexSelector;
    const testComponents = [
      {
        it: 'should render basic maths and Abell Variables',
        selector: '[data-test="basic-test"]'
      },
      {
        it: 'should render contentArray loop',
        selector: '[data-test="contentarray-container"]'
      }
    ];

    beforeAll(() => {
      indexSelector = getSelector(path.join(examplePath, 'index.html'));
    });

    for (const testComponent of testComponents) {
      it(testComponent.it, () => {
        expect(indexSelector(testComponent.selector).html()).toMatchSnapshot();
      });
    }
  });

  // // another-blog index
  describe('another-blog/*', () => {
    /**
     * Tests-
     * another-blog/index.html
     * & another-blog/example.html
     */

    let indexSelector;
    let exampleSelector;
    const testComponents = [
      {
        it: 'should render base info of blog',
        selector: '[data-test="basic-info"]'
      },
      {
        it: 'should render blog content',
        selector: '[data-test="blog-content"]'
      }
    ];

    beforeAll(() => {
      indexSelector = getSelector(
        path.join(examplePath, 'another-blog', 'index.html')
      );

      exampleSelector = getSelector(
        path.join(examplePath, 'another-blog', 'example.html')
      );
    });

    for (const testComponent of testComponents) {
      it(testComponent.it, () => {
        expect(indexSelector(testComponent.selector).html()).toMatchSnapshot();
      });
    }

    it('should render name of blog in example.html', () => {
      expect(exampleSelector('body').html().trim()).toBe('another-blog');
    });
  });

  describe('new-blog/', () => {
    /**
     * Tests-
     * new-blog/*
     */
    it('should have index.html and example.html in new-blog', () => {
      expect(
        fs.existsSync(path.join(examplePath, 'new-blog', 'index.html'))
      ).toBe(true);

      expect(
        fs.existsSync(path.join(examplePath, 'new-blog', 'example.html'))
      ).toBe(true);
    });

    describe('sub-blog/', () => {
      it('should render expected blog content in index.html', () => {
        expect(
          getSelector(
            path.join(examplePath, 'new-blog', 'sub-blog', 'index.html')
          )('[data-test="blog-content"]').html()
        ).toMatchSnapshot();
      });

      it('should render path to the blog in example.html', () => {
        expect(
          getSelector(
            path.join(examplePath, 'new-blog', 'sub-blog', 'example.html')
          )('body')
            .html()
            .trim()
        ).toBe('new-blog/sub-blog');
      });
    });
  });

  // deep
  describe('deep/', () => {
    /**
     * Tests-
     * deep/index.html
     * & deep/moredeep/index.html
     */
    let deepIndex;
    let moreDeepIndex;

    beforeAll(() => {
      deepIndex = getSelector(path.join(examplePath, 'deep', 'index.html'));
      moreDeepIndex = getSelector(
        path.join(examplePath, 'deep', 'moredeep', 'index.html')
      );
    });

    it('should render html body text of deep/index.html', () => {
      expect(deepIndex('body').html()).toBe('ok ..');
    });

    it('should render html of deep/moredeep/index.html', () => {
      expect(moreDeepIndex('body').html()).toBe('../..');
    });
  });
});
