import { test, describe, expect } from 'vitest';
import { getURLFromFilePath, getFilePathFromURL } from '../internal-utils';
import { evaluateAbellBlock } from '../evaluateAbellBlock';
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

describe('getFilePathFromURL()', () => {
  test('should return `index.abell` on /', () => {
    expect(getFilePathFromURL('/', BASE_PATH)).toBe(prefix('index.abell'));
  });

  test('should return `about.abell` route on /about', () => {
    expect(getFilePathFromURL('/about', BASE_PATH)).toBe(prefix('about.abell'));
  });

  test('should return `/nested/index.abell` route on /nested', () => {
    expect(getFilePathFromURL('/nested', BASE_PATH)).toBe(
      prefix('nested/index.abell')
    );
  });
});

describe('evaluateAbellBlock()', () => {
  test('should return evaluated number', () => {
    expect(evaluateAbellBlock(3 + 2)).toBe(5);
  });

  test('should return the return of function', () => {
    expect(evaluateAbellBlock(() => 3)).toBe(3);
  });

  test('should return an empty string on undefined and null', () => {
    expect(evaluateAbellBlock(undefined)).toBe('');
    expect(evaluateAbellBlock(null)).toBe('');
  });

  test('should return exact string on giving string', () => {
    expect(evaluateAbellBlock('hello')).toBe('hello');
  });

  test('should return false on false', () => {
    expect(evaluateAbellBlock(false)).toBe(false);
  });

  test('should return true on true', () => {
    expect(evaluateAbellBlock(true)).toBe(true);
  });

  test('should join an array', () => {
    expect(evaluateAbellBlock([1, 2, 3])).toBe('123');
  });

  test('should return 0 on given 0', () => {
    expect(evaluateAbellBlock(0)).toBe(0);
  });

  test('should return string response for recursive functions', () => {
    expect(evaluateAbellBlock(() => () => [1, 2, 3])).toBe('123');
  });

  test('should return nothing for null returning function', () => {
    expect(evaluateAbellBlock(() => null)).toBe('');
  });

  test('should return stringified object on json', () => {
    expect(evaluateAbellBlock({ hi: 'hey' })).toBe('{"hi":"hey"}');
  });
});
