import { test, describe, expect } from 'vitest';
import { recursiveFindFiles, getURLFromFilePath } from '../internal-utils';
import { BASE_PATH, prefix } from './test-utils';

describe('getURLFromFilePath()', () => {
  test('should return `/` route on index.abell file', () => {
    expect(getURLFromFilePath(prefix('index.abell'), BASE_PATH)).toBe('/');
  });

  test('should return `/about` route on about.abell file', () => {
    expect(getURLFromFilePath(prefix('about.abell'), BASE_PATH)).toBe('/about');
    expect(getURLFromFilePath(prefix('/about.abell'), BASE_PATH)).toBe(
      '/about'
    );
  });

  test('should return `/nested` route on nested/index.abell file', () => {
    expect(getURLFromFilePath(prefix('nested/index.abell'), BASE_PATH)).toBe(
      '/nested'
    );

    expect(getURLFromFilePath(prefix('nested/index.abell/'), BASE_PATH)).toBe(
      '/nested'
    );
  });
});

describe('recursiveFindFiles()', () => {
  test('should return array of abell files paths', () => {
    expect(recursiveFindFiles(BASE_PATH, '.abell')).toEqual([
      prefix('_components/navbar.abell'),
      prefix('about.abell'),
      prefix('nested/index.abell')
    ]);
  });
});
