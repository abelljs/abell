const expect = require('chai').expect;
const cheerio = require('cheerio');

const {
  execRegexOnAll,
  addToHeadEnd,
  addToBodyEnd
} = require('../src/utils/general-helpers.js');

describe('execRegexOnAll()', () => {
  it('should return all matches & index on applying the given regex', () => {
    const template = `
      <link rel="preload" href="one.css" />
      <a href='two.html' />
      <img src="three.png" />
    `;

    const { matches } = execRegexOnAll(
      / (?:href|src)=["'`](.*?)["'`]/g,
      template
    );

    // prettier-ignore
    expect(matches)
      .to.eql([
        [
          " href=\"one.css\"",
          "one.css"
        ],
        [
          " href='two.html'",
          "two.html"
        ],
        [
          " src=\"three.png\"",
          "three.png"
        ]
      ])

    expect(matches[1].index).to.equal(template.indexOf(" href='two.html'"));
  });
});


describe('addToHeadEnd()', () => {
  it('should add given string in <head></head> of HTML', () => {
    const template = `
      <html>
        <head>
          <script src="nice.js"></script>
        </head>
        <body>
          hello
        </body>
      </html>
    `;

    const out = addToHeadEnd(template, `<link rel="stylesheet" href="abell.css" />`);
    const $ = cheerio.load(out);
    // prettier-ignore
    expect($('head > link[rel="stylesheet"]').attr('href')).to.equal('abell.css')
    expect(out.includes('</head>')).to.equal(true);

  });

  it('should add given string in <head></head> of HTML when template does not have head', () => {
    const template = `
      <html>
        <body>
          hello
        </body>
      </html>
    `;

    const out = addToHeadEnd(template, `<link rel="stylesheet" href="abell.css" />`);
    const $ = cheerio.load(out);
    // prettier-ignore
    expect($('head > link[rel="stylesheet"]').attr('href')).to.equal('abell.css')
    expect(out.includes('</head>')).to.equal(true);
  });
});

describe('addToBodyEnd()', () => {
  it('should add given string to the end of body tag', () => {
    const template = `
      <html>
        <head>
          <script src="nice.js"></script>
        </head>
        <body>
          hello
        </body>
      </html>
    `;

    const out = addToBodyEnd(template, `<link rel="stylesheet" href="abell.css" />`);
    const $ = cheerio.load(out);
    // prettier-ignore
    expect($('body > link[rel="stylesheet"]').attr('href')).to.equal('abell.css')
    expect(out.includes('</body>')).to.equal(true);

  });
});
