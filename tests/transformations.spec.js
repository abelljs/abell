const expect = require('chai').expect;

const {
  prefetchLinksAndAddToPage,
  addPrefixInHTMLPaths
} = require('../src/utils/transformations.js');

describe('addPrefixInHTMLPaths()', () => {
  it('should add prefix to HTML paths', () => {
    const template = /* html */ `
      <link rel="preload" href="one.css" />
      <a href='two.html'></a>
      <a href='https://google.com/hi.html'></a>
      <img src="three.png" />
    `;
    // prettier-ignore
    expect(addPrefixInHTMLPaths(template, '..'))
      .to.equal(/* html */ `
      <link rel="preload" href="../one.css" />
      <a href='../two.html'></a>
      <a href='https://google.com/hi.html'></a>
      <img src="../three.png" />
    `)
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
