const expect = require('chai').expect;

const {
  getBaseProgramInfo,
  importAndRender
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
    const shouldOutput = `
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
