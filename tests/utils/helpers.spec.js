const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;

const {
  getAbellConfigs,
  createPathIfAbsent,
  execRegexOnAll,
  recursiveFindFiles
} = require('../../src/utils/helpers.js');

describe('recursiveFindFiles()', () => {
  // eslint-disable-next-line max-len
  it('should return paths of all files in test_recursiveFindFiles directory', () => {
    // prettier-ignore
    // eslint-disable-next-line max-len
    expect(recursiveFindFiles('tests/resources/test_recursiveFindFiles', '.abell'))
      .to.be.an('array')
      .that.has.members([
        'tests/resources/test_recursiveFindFiles/deep/moredeep/jkl',
        'tests/resources/test_recursiveFindFiles/ghi',
        'tests/resources/test_recursiveFindFiles/one/abc',
        'tests/resources/test_recursiveFindFiles/two/def'
      ].map(nonCrossPlatformPaths => 
          nonCrossPlatformPaths.replace(/\//g, path.sep)
        )
      );
  });
});

describe('getAbellConfigs()', () => {
  before(() => {
    process.chdir('tests/resources/test_demo');
  });

  it('should return siteName from abell.config.js', () => {
    // prettier-ignore
    expect(getAbellConfigs().globalMeta.siteName)
      .to.equal('Abell Test Working!');
  });

  after(() => {
    process.chdir('../../..');
  });
});

describe('createPathIfAbsent()', () => {
  before(() => {
    process.chdir('tests/resources/test_demo');
  });

  it('should create /newly/created/path if it is not present', () => {
    const newPath = path.join(process.cwd(), 'newly', 'created', 'path');
    createPathIfAbsent(newPath);
    expect(fs.existsSync(newPath)).to.equal(true);
    // Deleting newly created path
    fs.rmdirSync(newPath);
    fs.rmdirSync(path.join(newPath, '..'));
    fs.rmdirSync(path.join(newPath, '..', '..'));
  });

  after(() => {
    process.chdir('../../..');
  });
});

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
