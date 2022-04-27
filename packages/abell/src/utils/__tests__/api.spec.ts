import { test, describe, expect } from 'vitest';
import { makeRoutesFromGlobImport } from '../api';

describe('makeRoutesFromGlobImport()', () => {
  const abellPages = {
    './src/index.abell': {
      default: () => 'index'
    },
    './src/about.abell': {
      default: () => 'about'
    },
    './src/nested/index.abell': {
      default: () => 'nested'
    },
    './src/_components/navbar.abell': {
      default: () => 'nav'
    },
    './src/components/_navbar.abell': {
      default: () => 'nav2'
    }
  };

  test('should return routes object based on abellPages', () => {
    const routes = makeRoutesFromGlobImport(abellPages);
    const paths = routes.map((route) => route.path);
    const renderOutputs = routes.map((route) => route.render());
    expect(routes[0]).toHaveProperty('path');
    expect(routes[0]).toHaveProperty('render');
    expect(paths).toEqual(['/', '/about', '/nested']);
    expect(renderOutputs).toEqual(['index', 'about', 'nested']);
  });

  test('should allow underscore routes with ignoreUnderScoreURLs false', () => {
    const routes = makeRoutesFromGlobImport(abellPages, {
      ignoreUnderscoreURLs: false
    });
    const paths = routes.map((route) => route.path);
    const renderOutputs = routes.map((route) => route.render());
    expect(paths).toEqual([
      '/',
      '/about',
      '/nested',
      '/_components/navbar',
      '/components/_navbar'
    ]);
    expect(renderOutputs).toEqual(['index', 'about', 'nested', 'nav', 'nav2']);
  });

  test('should support markdown pages with layout attribute', () => {
    const abellAndMarkdownPages = {
      './src/index.abell': {
        default: () => 'index'
      },
      './src/_test.abell': {
        default: ({ children }: { children: string }) =>
          `<div>${children}</div>`
      },
      './hello-world.md': {
        attributes: {
          layout: './_test.abell'
        },
        default: '<h2>Hello</h2>'
      }
    };
    const routes = makeRoutesFromGlobImport(abellAndMarkdownPages);
    for (const route of routes) {
      console.log({ path: route.path, html: route.render() });
    }
  });
});
