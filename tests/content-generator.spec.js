const expect = require('chai').expect;

const {
  getBaseProgramInfo,
  importAndRender,
  prefetchLinksAndAddToPage
} = require('../src/content-generator.js');

describe('getBaseProgramInfo()', () => {
  before(() => {
    process.chdir('tests/resources/test_demo');
  });

  it('should return the base info for program to execute', () => {
    expect(getBaseProgramInfo())
      .to.be.an('object')
      .to.have.keys([
        'abellConfigs',
        'contentTemplate',
        'vars',
        'contentTemplatePath',
        'contentDirectories',
        'logs'
      ]);
  });

  after(() => {
    process.chdir('../../..');
  });
});

describe('importAndRender()', () => {
  it('should return HTML of the md file in given path', () => {
    const shouldOutput = /* html */ `
      <h1 id="abell-test-title-check">Abell Test Title Check</h1>
      <p>Hi this my another blog.
        <b>Nice</b>
      </p>
      <pre>
        <code class="language-js">const s = 'cool'</code>
      </pre>
    `;

    expect(
      importAndRender(
        'another-blog/index.md',
        'tests/resources/test_demo/content',
        {
          meta: { title: 'Abell Test Title Check' }
        }
      ).replace(/[\n ]/g, '')
    ).to.equal(shouldOutput.replace(/[\n ]/g, ''));
  });
});

describe('prefetchLinksAndAddToPage()', () => {
  // eslint-disable-next-line max-len
  it('should add links from `from` parameter to `addTo` parameter as prefetch', () => {
    expect(
      prefetchLinksAndAddToPage({
        from: /* html */ `
          <html>
            <head>
              <link rel="stylesheet" href="one.css" />
              <link rel="preload" href="two.css" as="style" />
              <script src="three.js"></script>
            </head>
            <body>
              <script src="four.js"></script>
            </body>
          </html>`,
        addTo: /* html */ `
          <html>
            <head>
              <link rel="stylesheet" href="keepitasitis.css" />
            </head>
          </html>
        `
      }).replace(/ |\n/g, '')
    ).to.equal(
      /* html */ `
    <html>
      <head>
        <link rel="stylesheet" href="keepitasitis.css" />
        <!-- Abell prefetch -->
        <link rel="prefetch" href="one.css" as="style" />
        <link rel="prefetch" href="two.css" as="style" />
        <link rel="prefetch" href="three.js" as="script" />
        <link rel="prefetch" href="four.js" as="script" />
     </head>
    </html>
    `.replace(/ |\n/g, '')
    );
  });
});
