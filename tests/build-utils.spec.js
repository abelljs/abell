/* eslint-disable max-len */
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;

const {
  getProgramInfo,
  buildTemplateMap,
  buildContentMap,
  getContentMeta,
  getSourceNodeFromPluginNode,
  renderMarkdown,
  getAbellConfig
} = require('../src/utils/build-utils.js');

describe('utils/build-utils.js', () => {
  describe('#getProgramInfo()', () => {
    before(() => {
      process.chdir(
        path.join(__dirname, 'test-utils', 'resources', 'test_demo')
      );
    });

    it('should return the base info for program to execute', async () => {
      expect(getProgramInfo())
        .to.be.an('object')
        .to.have.keys([
          'abellConfig',
          'command',
          'contentMap',
          'templateMap',
          'task',
          'port',
          'logs'
        ]);
    });

    after(() => {
      process.chdir(__dirname);
    });
  });

  describe('#buildTemplateMap()', () => {
    it('should build templateMap with expected properties and values', () => {
      const themePath = path.join(
        __dirname,
        'test-utils',
        'resources',
        'test_demo',
        'src'
      );

      const templateMap = buildTemplateMap(themePath);

      // Makes sure Component.abell exists in test_demo
      expect(fs.existsSync(path.join(themePath, 'Component.abell'))).to.equal(
        true
      );

      expect(Object.keys(templateMap)).to.have.members([
        `[path]${path.sep}index.abell`,
        'about.abell',
        'index.abell'
      ]);

      expect(templateMap[`[path]${path.sep}index.abell`].shouldLoop).to.equal(
        true
      );
      expect(templateMap[`[path]${path.sep}index.abell`].$root).to.equal('..');

      expect(templateMap['index.abell'].shouldLoop).to.equal(false);
      expect(templateMap['index.abell'].$root).to.equal('');
    });
  });

  describe('#buildContentMap()', () => {
    it('should return all the information about the content', () => {
      const contentPath = path.join(
        __dirname,
        'test-utils',
        'resources',
        'test_demo',
        'content'
      );

      const contentMap = buildContentMap(contentPath);

      expect(Object.keys(contentMap)).to.have.members([
        'another-blog',
        'my-first-blog',
        `my-first-blog${path.sep}sub-blog`
      ]);

      expect(contentMap['another-blog'].$root).to.equal('..');

      expect(contentMap[`my-first-blog${path.sep}sub-blog`].$root).to.equal(
        `..${path.sep}..`
      );
    });
  });

  describe('#getAbellConfig()', () => {
    before(() => {
      process.chdir(
        path.join(__dirname, 'test-utils', 'resources', 'test_demo')
      );
    });

    it('should return siteName from abell.config.js', () => {
      const abellConfig = getAbellConfig();
      expect(abellConfig.globalMeta.siteName).to.equal('Abell Test Working!');
    });

    it('should expect default contentPath, themePath and outputPath values', () => {
      const abellConfig = getAbellConfig();
      expect(Object.keys(abellConfig)).to.eql([
        'outputPath',
        'themePath',
        'contentPath',
        'plugins',
        'globalMeta'
      ]);
    });

    after(() => {
      process.chdir(
        path.join(__dirname, 'test-utils', 'resources', 'test_demo')
      );
    });
  });

  describe('#getSourceNodeFromPluginNode', () => {
    it('should map title and $path when not given', () => {
      const pluginNode = {
        slug: 'blog-from-plugin',
        content: `# Hello
        Woop Woop`,
        createdAt: new Date('3 May 2020'),
        foo: 'bar'
      };

      const contentNode = getSourceNodeFromPluginNode(pluginNode);
      expect(contentNode.$slug).to.equal('blog-from-plugin');
      expect(contentNode.$path).to.equal('blog-from-plugin');
      expect(contentNode.title).to.equal('blog-from-plugin');
      expect(contentNode.foo).to.equal('bar');
      expect(contentNode.$source).to.equal('plugin');
      expect(contentNode.$root).to.equal('..');
      expect(contentNode.$createdAt).to.be.a('Date');
      expect(contentNode.$modifiedAt).to.be.a('Date');

      expect(contentNode.$createdAt.toDateString()).to.equal('Sun May 03 2020');
      expect(contentNode.$modifiedAt.toDateString()).to.equal(
        'Sun May 03 2020'
      );
    });
  });

  describe('#renderMarkdown()', () => {
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
        renderMarkdown(
          path.join(
            __dirname,
            'test-utils/resources/test_demo/content/another-blog/index.md'
          ),
          {
            meta: { title: 'Abell Test Title Check' }
          }
        ).replace(/[\n ]/g, '')
      ).to.equal(shouldOutput.replace(/[\n ]/g, ''));
    });
  });

  describe('#getContentMeta', () => {
    it('should ', () => {
      const contentPath = path.join(
        __dirname,
        'test-utils',
        'resources',
        'test_demo',
        'content'
      );

      const anotherBlogMeta = getContentMeta('another-blog', { contentPath });

      expect(anotherBlogMeta.$slug).to.equal('another-blog');
      expect(anotherBlogMeta.title).to.equal('Another blog');
      expect(anotherBlogMeta.$source).to.equal('local');
      expect(anotherBlogMeta.description).to.equal('Amazing blog right');
      expect(anotherBlogMeta.$createdAt.toDateString()).to.equal(
        'Mon May 11 2020'
      );
    });
  });
});
