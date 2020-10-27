/**
 * Tests src/utils/general-helpers.js
 */

const path = require('path');

/* eslint-disable max-len */
const cheerio = require('cheerio');

const {
  execRegexOnAll,
  addToHeadEnd,
  addToBodyEnd,
  standardizePath
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

    const matchesArr = matches.map((match) => {
      return [match[0], match[1], match.index];
    });

    expect(matchesArr).toEqual([
      [' href="one.css"', 'one.css', 26],
      [" href='two.html'", 'two.html', 53],
      [' src="three.png"', 'three.png', 83]
    ]);

    expect(matches[1].index).toBe(template.indexOf(" href='two.html'"));
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

    const out = addToHeadEnd(
      `<link rel="stylesheet" href="abell.css" />`,
      template
    );
    const $ = cheerio.load(out);
    // prettier-ignore
    expect($('head > link[rel="stylesheet"]').attr('href')).toBe('abell.css')
    expect(out.includes('</head>')).toBe(true);
  });

  it('should add given string in <head></head> of HTML when template does not have head', () => {
    const template = `
      <html>
        <body>
          hello
        </body>
      </html>
    `;

    const out = addToHeadEnd(
      `<link rel="stylesheet" href="abell.css" />`,
      template
    );
    const $ = cheerio.load(out);
    // prettier-ignore
    expect($('head > link[rel="stylesheet"]').attr('href')).toBe('abell.css')
    expect(out.includes('</head>')).toBe(true);
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

    const out = addToBodyEnd(
      `<link rel="stylesheet" href="abell.css" />`,
      template
    );
    const $ = cheerio.load(out);
    // prettier-ignore
    expect($('body > link[rel="stylesheet"]').attr('href')).toBe('abell.css')
    expect(out.includes('</body>')).toBe(true);
  });
});

describe('standardizePath()', () => {
  it('should always return standard web path with / as separator', () => {
    expect(standardizePath('hello/hi/nice.html', '/')).toBe(
      'hello/hi/nice.html'
    );

    expect(standardizePath('hello\\hi\\nice.html', '\\\\')).toBe(
      'hello/hi/nice.html'
    );

    expect(standardizePath(path.join('hello', 'hi', 'test.abell'))).toBe(
      'hello/hi/test.abell'
    );
  });
});
