import path from 'path';
import { test, describe, expect } from 'vitest';
import {
  getFilePathFromURL,
  recursiveFindFiles,
  getURLFromFilePath
} from '../general-utils';

const BASE_PATH = path.join(__dirname, 'test-files');
const prefix = (fileName: string): string => path.join(BASE_PATH, fileName);

describe('getFilePathFromURL()', () => {
  test('should return index.abell on `/` route', () => {
    expect(getFilePathFromURL('/', BASE_PATH)).toBe(prefix('index.abell'));
  });

  test('should return about.abell on `/about` route', () => {
    expect(getFilePathFromURL('/about', BASE_PATH)).toBe(prefix('about.abell'));
  });

  test('should handle nested routes', () => {
    expect(getFilePathFromURL('/nested', BASE_PATH)).toBe(
      prefix('nested/index.abell')
    );
  });
});

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
      prefix('about.abell'),
      prefix('nested/index.abell')
    ]);
  });
});
