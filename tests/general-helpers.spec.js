const expect = require('chai').expect;

const {
  execRegexOnAll
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
