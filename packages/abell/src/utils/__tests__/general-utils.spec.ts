import path from 'path';
import { test, describe, expect } from 'vitest';
import { getFilePathFromURL } from '../general-utils';

const BASE_PATH = path.join(__dirname, 'test-files');
const prefix = (fileName: string): string =>
  path.join(__dirname, 'test-files', fileName);

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
