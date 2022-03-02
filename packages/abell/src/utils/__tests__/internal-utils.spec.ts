import { test, describe, expect } from 'vitest';
import { getURLFromFilePath, evaluateAbellBlock } from '../internal-utils';
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
});
