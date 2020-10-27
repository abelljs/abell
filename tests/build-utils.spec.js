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
  getContentMeta,
  getSourceNodeFromPluginNode,
  getAbellConfig,
  renderMarkdown
} = require('../src/utils/build-utils.js');

const { resPath } = require('./test-utils/helpers.js');

const demoPath = path.join(__dirname, 'demos');

describe('utils/build-utils.js', () => {
  describe('#getProgramInfo()', () => {
    const examplePath = path.join(demoPath, 'test-example-minimal');

    beforeAll(() => {
      process.chdir(examplePath);
    });

    afterAll(() => {
      process.chdir(__dirname);
    });

    it('should return the base info for program to execute', async () => {
      const tempConsoleLog = console.log;
      console.log = jest.fn((message) => message);

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
      expect(console.log.mock.results[0].value).toContain('Cannot find module');
      console.log = tempConsoleLog;
    });
  });

  describe('#buildTemplateMap()', () => {
    const examplePath = path.join(demoPath, 'test-example-main');

    it('should build templateMap with expected properties and values', () => {
      const themePath = path.join(examplePath, 'theme');

      const expectedTemplateMap = {
        [resPath('[path]/index.abell')]: {
          $root: '..',
          htmlPath: resPath('[path]/index.html'),
          shouldLoop: true,
          templatePath: resPath('[path]/index.abell')
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
    const examplePath = path.join(demoPath, 'test-example-main');

    it('should return all the information about the content', () => {
      const contentPath = path.join(examplePath, 'content');
      const contentMap = buildContentMap(contentPath);
      const expectedContentMap = {
        [resPath('deep/extra-deep')]: {
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
    const examplePath = path.join(demoPath, 'test-example-main');

    beforeAll(() => {
      process.chdir(path.join(examplePath));
    });

    afterAll(() => {
      process.chdir(path.join(__dirname));
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
  });

  describe('#getSourceNodeFromPluginNode', () => {
    it('should map title and $path when not given', () => {
      const pluginNode = {
        slug: 'blog-from-plugin',
        content: `# Hello
        Woop Woop`,
        createdAt: new Date('2020-05-02T18:30:00.000Z'),
        foo: 'bar'
      };

      const expectedSourceNode = {
        slug: 'blog-from-plugin',
        content: '# Hello\n        Woop Woop',
        createdAt: new Date('2020-05-02T18:30:00.000Z'),
        foo: 'bar',
        title: 'blog-from-plugin',
        description: 'This is blog-from-plugin...',
        $path: 'blog-from-plugin',
        $slug: 'blog-from-plugin',
        $createdAt: new Date('2020-05-02T18:30:00.000Z'),
        $modifiedAt: new Date('2020-05-02T18:30:00.000Z'),
        $root: '..',
        $source: 'plugin'
      };

      const contentNode = getSourceNodeFromPluginNode(pluginNode);
      expect(contentNode).toEqual(expectedSourceNode);
    });
  });

  describe('#renderMarkdown()', () => {
    it('should return HTML of the md file in given path', () => {
      const markdown = renderMarkdown(
        path.join(demoPath, 'test-example-main', 'content', 'index.md'),
        {
          meta: { title: 'Abell Test Title Check' }
        }
      );

      expect(markdown).toMatchSnapshot();
    });
  });

  describe('#getContentMeta', () => {
    it('should return meta content of blog on given blog name', () => {
      const contentPath = path.join(demoPath, 'test-example-main', 'content');

      const metaContent = getContentMeta('hello-world', { contentPath });

      const expectedMetaContent = {
        title: 'hello-world',
        description: 'Hi, This is hello-world...',
        $slug: 'hello-world',
        $source: 'local',
        $modifiedAt: new Date('2020-05-29T18:30:00.000Z'),
        $createdAt: new Date('2020-05-19T18:30:00.000Z'),
        $path: 'hello-world',
        $root: '..'
      };

      expect(metaContent).toEqual(expectedMetaContent);
    });
  });
});
