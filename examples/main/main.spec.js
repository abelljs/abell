const path = require('path');

const {
  preTestSetup,
  getSelector
} = require('../../tests/test-utils/helpers.js');

describe('examples/main', () => {
  beforeAll(async () => {
    await preTestSetup('main');
  });

  describe('dist/index.html', () => {
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
      indexSelector = getSelector(path.join(__dirname, 'dist', 'index.html'));
    });

    for (const testComponent of testComponents) {
      it(testComponent.it, () => {
        expect(indexSelector(testComponent.selector).html()).toMatchSnapshot();
      });
    }
  });

  // // another-blog example
  // describe('another-blog/example.html', () => {
  //   let $;
  //   before(() => {
  //     $ = getSelector(
  //       path.join(__dirname, 'dist', 'another-blog', 'example.html')
  //     );
  //   });

  //   it('should render body text', () => {
  //     expect($('body').html().trim()).to.equal('another-blog');
  //   });
  // });

  // // another-blog index
  // describe('another-blog/index.html', () => {
  //   let $;
  //   before(() => {
  //     $ = getSelector(
  //       path.join(__dirname, 'dist', 'another-blog', 'index.html')
  //     );
  //   });

  //   it('should render header text', () => {
  //     expect($('[id="another-blog"]').html()).to.equal('Another blog');
  //   });

  //   it('should render all blogs into blog container', () => {
  //     const blogs = ['..', 'another-blog', 'another-blog'];

  //     $('#blog-container span').each(function (index, element) {
  //       expect($(this).html()).to.equal(blogs[index]);
  //     });
  //   });

  //   it('should render first para text', () => {
  //     const dateToCheck = new Date();
  //     dateToCheck.setFullYear(2020, 4, 9);
  //     dateToCheck.setHours(0);
  //     dateToCheck.setMinutes(0);
  //     dateToCheck.setSeconds(0);
  //     expect($('body main section p').first().html()).to.equal(
  //       dateToCheck.toString()
  //     );
  //   });

  //   it('should render last para text', () => {
  //     expect($('body main section p').last().html()).to.equal(
  //       'Amazing blog right'
  //     );
  //   });
  // });

  // // deep
  // describe('deep/index.html', () => {
  //   let $;
  //   before(() => {
  //     $ = getSelector(path.join(__dirname, 'dist', 'deep', 'index.html'));
  //   });

  //   it('should render html body text', () => {
  //     expect($('body').html()).to.equal('ok ..');
  //   });
  // });

  // // more deep
  // describe('deep/moredeep/index.html', () => {
  //   let $;
  //   before(() => {
  //     $ = getSelector(
  //       path.join(__dirname, 'dist', 'deep', 'moredeep', 'index.html')
  //     );
  //   });

  //   it('should render html body text', () => {
  //     expect($('body').html()).to.equal(`..${path.sep}..`);
  //   });
  // });

  // // my first blog example
  // describe('my-first-blog/example.html', () => {
  //   let $;
  //   before(() => {
  //     $ = getSelector(
  //       path.join(__dirname, 'dist', 'my-first-blog', 'example.html')
  //     );
  //   });

  //   it('should render html body text', () => {
  //     expect($('body').text().trim()).to.equal('my-first-blog');
  //   });
  // });

  // // my first blog index
  // describe('my-first-blog/index.html', () => {
  //   let $;
  //   before(() => {
  //     $ = getSelector(
  //       path.join(__dirname, 'dist', 'my-first-blog', 'index.html')
  //     );
  //   });

  //   it('should render section header text', () => {
  //     expect($('section #test').text()).to.equal('test');
  //   });

  //   it('should render section hyperlink', () => {
  //     expect($('section p').text()).to.equal('https://makethislink.com');
  //   });

  //   it('should render all blogs into blog container', () => {
  //     const blogs = ['..', 'my-first-blog', 'my-first-blog'];

  //     $('#blog-container span').each(function (index, element) {
  //       expect($(this).html()).to.equal(blogs[index]);
  //     });
  //   });
  // });

  // // new blog example
  // describe('new-blog/example.html', () => {
  //   let $;
  //   before(() => {
  //     $ = getSelector(path.join(__dirname, 'dist', 'new-blog', 'example.html'));
  //   });

  //   it('should render html body text', () => {
  //     expect($('body').text().trim()).to.equal('new-blog');
  //   });
  // });

  // // new blog
  // describe('new-blog/index.html', () => {
  //   let $;
  //   before(() => {
  //     $ = getSelector(path.join(__dirname, 'dist', 'new-blog', 'index.html'));
  //   });

  //   it('should render all blogs into blog container', () => {
  //     const blogs = ['..', 'new-blog', 'new-blog'];

  //     $('#blog-container span').each(function (index, element) {
  //       expect($(this).html()).to.equal(blogs[index]);
  //     });
  //   });
  //   it('should render header text', () => {
  //     expect($('body main section #newblog').html()).to.equal('new-blog');
  //   });
  //   it('should render first para text', () => {
  //     expect($('body main section p').first().html()).to.equal('..');
  //   });
  //   it('should render global meta site name', () => {
  //     expect($('body main section p').last().html()).to.equal(
  //       '{{ Abell.globalMeta.siteName }}'
  //     );
  //   });
  // });

  // // new blog/sub blog/example
  // describe('new-blog/sub-blog/example.html', () => {
  //   let $;
  //   before(() => {
  //     $ = getSelector(
  //       path.join(__dirname, 'dist', 'new-blog', 'sub-blog', 'example.html')
  //     );
  //   });

  //   it('should render html body text', () => {
  //     expect($('body').text().trim()).to.equal(`new-blog${path.sep}sub-blog`);
  //   });
  // });

  // describe('new-blog/sub-blog/index.html', () => {
  //   let $;
  //   before(() => {
  //     $ = getSelector(
  //       path.join(__dirname, 'dist', 'new-blog', 'sub-blog', 'index.html')
  //     );
  //   });

  //   it('should render all blogs into blog container', () => {
  //     const blogs = [
  //       `..${path.sep}..`,
  //       `new-blog${path.sep}sub-blog`,
  //       'sub-blog'
  //     ];

  //     $('#blog-container span').each(function (index, element) {
  //       expect($(this).html()).to.equal(blogs[index]);
  //     });
  //   });

  //   it('should render header text', () => {
  //     expect($('body main section #inside-the-new-blog').html()).to.equal(
  //       'Inside the new blog'
  //     );
  //   });

  //   it('should render first para text', () => {
  //     expect($('body main section > p:nth-child(2)').text()).to.equal(
  //       `..${path.sep}..`
  //     );
  //   });

  //   it('should have relative path to index.md', () => {
  //     expect($('body main section > p:nth-child(3) > a').attr('href')).to.equal(
  //       `hello`
  //     );
  //   });

  //   it('should add prefix in paths for deep level folders', () => {
  //     expect($('main img').attr('src')).to.equal(
  //       `..${path.sep}../image/cool.png`
  //     );
  //   });
  // });
});
