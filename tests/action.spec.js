const fs = require('fs');
const expect = require('chai').expect;

const { build } = require('../src/action.js');
const { getDirectories } = require('../src/helpers.js');
const { getBaseProgramInfo } = require('../src/content-generator.js');

describe('action.build()', () => {
  before(() => {
    process.chdir('tests/resources/test_demo');
  });

  // eslint-disable-next-line max-len
  it('should execute build and the dist output should contain same output as expected_dist', () => {
    const programInfo = getBaseProgramInfo();
    programInfo.logs = 'none';
    programInfo.task = 'build';
    build(programInfo);

    const assertMap = [
      {
        built: fs.readFileSync('dist/index.html', 'utf8'),
        expected: fs.readFileSync('expected_dist/index.html', 'utf8')
      },
      {
        built: fs.readFileSync('dist/another-blog/index.html', 'utf8'),
        expected: fs.readFileSync(
          'expected_dist/another-blog/index.html',
          'utf8'
        )
      },
      {
        built: fs.existsSync('dist/another-blog/assets/nice.txt'),
        expected: fs.existsSync('expected_dist/another-blog/assets/nice.txt')
      }
    ];

    for (const { built, expected } of assertMap) {
      expect(built).to.equal(expected);
    }

    expect(getDirectories('expected_dist')).to.have.members(
      getDirectories('content')
    );
  });

  after(() => {
    process.chdir('../../..');
  });
});
