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

    const expectedIndex = fs.readFileSync('expected_dist/index.html', 'utf8');
    const builtIndex = fs.readFileSync('dist/index.html', 'utf8');
    expect(builtIndex).to.equal(expectedIndex);

    const allBlogs = getDirectories('expected_dist');
    expect(allBlogs).to.have.members(['another-blog', 'my-first-blog']);

    const expectedBlogContent = fs.readFileSync(
      'expected_dist/another-blog/index.html',
      'utf8'
    );
    const builtBlogContent = fs.readFileSync(
      'dist/another-blog/index.html',
      'utf8'
    );
    expect(builtBlogContent).to.equal(expectedBlogContent);
  });

  after(() => {
    process.chdir('../../..');
  });
});
