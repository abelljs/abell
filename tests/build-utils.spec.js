/**
 * Tests: src/utils/build-utils.js
 */

/* eslint-disable max-len */
// const fs = require('fs');
const path = require('path');

const {
  getProgramInfo,
  buildTemplateMap,
  buildContentMap,
  // getContentMeta,
  // getSourceNodeFromPluginNode,
  // renderMarkdown,
  getAbellConfig
} = require('../src/utils/build-utils.js');

const demoPath = path.join(__dirname, 'demos');

describe('utils/build-utils.js', () => {
  describe('#getProgramInfo()', () => {
    const examplePath = path.join(demoPath, 'build-utils-demo', 'programInfo');

    beforeAll(() => {
      process.chdir(examplePath);
    });

    it('should return the base info for program to execute', async () => {
      const expectedProgramInfo = {
        abellConfig: {
          outputPath: path.join(examplePath, 'dist'),
          themePath: path.join(examplePath, 'theme'),
          contentPath: path.join(examplePath, 'content'),
          plugins: [],
          globalMeta: {}
        },
        contentMap: {},
        templateMap: {
          'index.abell': {
            shouldLoop: false,
            templatePath: 'index.abell',
            htmlPath: 'index.html',
            $root: ''
          }
        },
        task: '',
        logs: 'minimum',
        command: {},
        port: 5000
      };

      const initialProgramInfo = getProgramInfo();
      expect(initialProgramInfo).toEqual(expectedProgramInfo);
    });

    afterAll(() => {
      process.chdir(__dirname);
    });
  });

  describe('#buildTemplateMap()', () => {
    const examplePath = path.join(demoPath, 'build-utils-demo', 'buildMaps');

    it('should build templateMap with expected properties and values', () => {
      const themePath = path.join(examplePath, 'theme');

      const expectedTemplateMap = {
        '[path]/index.abell': {
          $root: '..',
          htmlPath: '[path]/index.html',
          shouldLoop: true,
          templatePath: '[path]/index.abell'
        },
        'about.abell': {
          shouldLoop: false,
          templatePath: 'about.abell',
          htmlPath: 'about.html',
          $root: ''
        },
        'index.abell': {
          shouldLoop: false,
          templatePath: 'index.abell',
          htmlPath: 'index.html',
          $root: ''
        }
      };

      const templateMap = buildTemplateMap(themePath);

      expect(templateMap).toEqual(expectedTemplateMap);
    });
  });

  describe('#buildContentMap()', () => {
    const examplePath = path.join(demoPath, 'build-utils-demo', 'buildMaps');

    it('should return all the information about the content', () => {
      const contentPath = path.join(examplePath, 'content');
      const contentMap = buildContentMap(contentPath);
      const expectedContentMap = {
        'deep/extra-deep': {
          title: 'extra-deep',
          description: 'Hi, This is extra-deep...',
          $createdAt: new Date('2020-05-19T18:30:00.000Z'),
          $modifiedAt: new Date('2020-05-29T18:30:00.000Z'),
          $slug: 'extra-deep',
          $source: 'local',
          $path: 'deep/extra-deep',
          $root: '../..'
        },
        'hello-world': {
          title: 'hello-world',
          description: 'Hi, This is hello-world...',
          $slug: 'hello-world',
          $source: 'local',
          $modifiedAt: new Date('2020-05-29T18:30:00.000Z'),
          $createdAt: new Date('2020-05-19T18:30:00.000Z'),
          $path: 'hello-world',
          $root: '..'
        }
      };

      expect(contentMap).toEqual(expectedContentMap);
    });
  });

  describe('#getAbellConfig()', () => {
    const examplePath = path.join(demoPath, 'build-utils-demo', 'buildMaps');

    beforeAll(() => {
      process.chdir(path.join(examplePath));
    });

    it('should return expected object from abell.config.js', () => {
      const abellConfig = getAbellConfig();
      const expectedAbellConfig = {
        outputPath: path.join(examplePath, 'test-output-path'),
        themePath: path.join(examplePath, 'theme'),
        contentPath: path.join(examplePath, 'content'),
        plugins: ['plugin-test-1'],
        globalMeta: {
          test: 'pass'
        }
      };

      expect(abellConfig).toEqual(expectedAbellConfig);
    });

    afterAll(() => {
      process.chdir(path.join(__dirname));
    });
  });

  // describe('#getSourceNodeFromPluginNode', () => {
  //   it('should map title and $path when not given', () => {
  //     const pluginNode = {
  //       slug: 'blog-from-plugin',
  //       content: `# Hello
  //       Woop Woop`,
  //       createdAt: new Date('3 May 2020'),
  //       foo: 'bar'
  //     };

  //     const contentNode = getSourceNodeFromPluginNode(pluginNode);
  //     expect(contentNode.$slug).to.equal('blog-from-plugin');
  //     expect(contentNode.$path).to.equal('blog-from-plugin');
  //     expect(contentNode.title).to.equal('blog-from-plugin');
  //     expect(contentNode.foo).to.equal('bar');
  //     expect(contentNode.$source).to.equal('plugin');
  //     expect(contentNode.$root).to.equal('..');
  //     expect(contentNode.$createdAt).to.be.a('Date');
  //     expect(contentNode.$modifiedAt).to.be.a('Date');

  //     expect(contentNode.$createdAt.toDateString()).to.equal('Sun May 03 2020');
  //     expect(contentNode.$modifiedAt.toDateString()).to.equal(
  //       'Sun May 03 2020'
  //     );
  //   });
  // });

  // describe('#renderMarkdown()', () => {
  //   it('should return HTML of the md file in given path', () => {
  //     const shouldOutput = /* html */ `
  //       <h1 id="abell-test-title-check">Abell Test Title Check</h1>
  //       <p>Hi this my another blog.
  //         <b>Nice</b>
  //       </p>
  //       <pre>
  //         <code class="language-js">const s = 'cool'</code>
  //       </pre>
  //     `;

  //     expect(
  //       renderMarkdown(
  //         path.join(
  //           __dirname,
  //           'test-utils/resources/test_demo/content/another-blog/index.md'
  //         ),
  //         {
  //           meta: { title: 'Abell Test Title Check' }
  //         }
  //       ).replace(/[\n ]/g, '')
  //     ).to.equal(shouldOutput.replace(/[\n ]/g, ''));
  //   });
  // });

  // describe('#getContentMeta', () => {
  //   it('should ', () => {
  //     const contentPath = path.join(
  //       __dirname,
  //       'test-utils',
  //       'resources',
  //       'test_demo',
  //       'content'
  //     );

  //     const anotherBlogMeta = getContentMeta('another-blog', { contentPath });

  //     expect(anotherBlogMeta.$slug).to.equal('another-blog');
  //     expect(anotherBlogMeta.title).to.equal('Another blog');
  //     expect(anotherBlogMeta.$source).to.equal('local');
  //     expect(anotherBlogMeta.description).to.equal('Amazing blog right');
  //     expect(anotherBlogMeta.$createdAt.toDateString()).to.equal(
  //       'Mon May 11 2020'
  //     );
  //   });
  // });
});
