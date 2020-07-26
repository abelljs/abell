const path = require('path');

const {
  expect
} = require('chai');
const {
  preTestSetup,
  getSelector
} = require('../../tests/utils/test-helpers.js')

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
        'Another blog (another-blog)'
      ]

      $('[data-test="contentarray-container"] > div').each(function (index, element) {
        expect($(this).children('span.data-title').html())
          .to.equal(expectedTitles[index]);
      })
    })
  })

  //another-blog example
  describe('another-blog/example.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'another-blog', 'example.html'))
    })

    it('should render body text', () => {
      expect($('body').html().trim())
        .to.equal("another-blog");
    })
  })

  //another-blog index
  describe('another-blog/index.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'another-blog', 'index.html'))
    })

    it('should render header text', () => {
      expect($('[id="another-blog"]').html())
        .to.equal('Another blog');
    })

    it('should render all blogs into blog container', () => {
      let blogs = [
        '..',
        'another-blog',
        'another-blog',
      ]

      $('#blog-container span').each(function (index, element) {
        expect($(this).html()).to.equal(blogs[index]);
      });
    })

    it('should render first para text', () => {
      let dateToCheck = new Date();
      dateToCheck.setFullYear(2020, 4, 9);
      dateToCheck.setHours(0);
      dateToCheck.setMinutes(0);
      dateToCheck.setSeconds(0);
      expect($('body main section p').first().html())
        .to.equal(dateToCheck.toString());
    })

    it('should render last para text', () => {
      expect($('body main section p').last().html())
        .to.equal("Amazing blog right");
    })

  });

  //deep 
  describe('deep/index.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'deep', 'index.html'))
    })

    it('should render html body text', () => {
      expect($('body').html())
        .to.equal("ok ..");
    })
  })

  //more deep 
  describe('deep/moredeep/index.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'deep', 'moredeep', 'index.html'))
    })

    it('should render html body text', () => {
      expect($('body').html())
        .to.equal(`..${path.sep}..`);
    })
  })


  //my first blog example  
  describe('my-first-blog/example.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'my-first-blog', 'example.html'))
    })

    it('should render html body text', () => {
      expect($('body').text().trim())
        .to.equal("my-first-blog");
    })
  })

  //my first blog index
  describe('my-first-blog/index.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'my-first-blog', 'index.html'))
    })

    it('should render section header text', () => {
      expect($('section #test').text())
        .to.equal("test");
    })

    it('should render section hyperlink', () => {
      expect($('section p').text())
        .to.equal("https://makethislink.com");
    })

    it('should render all blogs into blog container', () => {
      let blogs = [
        '..',
        'my-first-blog',
        'my-first-blog',
      ]

      $('#blog-container span').each(function (index, element) {
        expect($(this).html()).to.equal(blogs[index]);
      });
    })
  })


  //new blog example  
  describe('new-blog/example.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'new-blog', 'example.html'))
    })

    it('should render html body text', () => {
      expect($('body').text().trim())
        .to.equal("new-blog");
    })
  })

  //new blog
  describe('new-blog/index.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'new-blog', 'index.html'))
    })

    it('should render all blogs into blog container', () => {
      let blogs = [
        '..',
        'new-blog',
        'new-blog',
      ]

      $('#blog-container span').each(function (index, element) {
        expect($(this).html()).to.equal(blogs[index]);
      });
    })
    it('should render header text', () => {
      expect($('body main section #newblog').html())
        .to.equal("new-blog");
    })
    it('should render first para text', () => {
      expect($('body main section p').first().html())
        .to.equal("..");
    })
    it('should render global meta site name', () => {
      expect($('body main section p').last().html())
        .to.equal("{{ globalMeta.siteName }}");
    })

  })

  //new blog/sub blog/example  
  describe('new-blog/sub-blog/example.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'new-blog', 'sub-blog', 'example.html'))
    })

    it('should render html body text', () => {
      expect($('body').text().trim())
        .to.equal(`new-blog${path.sep}sub-blog`);
    })
  });


  describe('new-blog/sub-blog/index.html', () => {
    let $;
    before(() => {
      $ = getSelector(path.join(__dirname, 'dist', 'new-blog', 'sub-blog', 'index.html'))
    })

    it('should render all blogs into blog container', () => {
      let blogs = [
        `..${path.sep}..`,
        `new-blog${path.sep}sub-blog`,
        'sub-blog',
      ]

      $('#blog-container span').each(function (index, element) {
        expect($(this).html()).to.equal(blogs[index]);
      });
    })
    it('should render header text', () => {
      expect($('body main section #inside-the-new-blog').html())
        .to.equal("Inside the new blog");
    })
    it('should render first para text', () => {
      expect($('body main section p').text())
        .to.equal(`..${path.sep}..`);
    })

  })


});