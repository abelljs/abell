/* eslint-disable max-len */
import path from 'path';
import { describe, test, expect } from 'vitest';
import { setPackageJSONValues } from '../steps';

describe('setNameInPackageJSON', () => {
  test('should set the name in package.json', () => {
    const packageJSONPath = path.join(
      __dirname,
      'test-utils',
      'test-package.json'
    );
    const randomPackageName = `test-package-123`;
    setPackageJSONValues(packageJSONPath, { name: randomPackageName });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJSONContent = require(packageJSONPath);
    expect(packageJSONContent.name).toBe(randomPackageName);
    expect(packageJSONContent.version).toBe('0.0.15');
    expect(packageJSONContent.description).toBe('test-description');
    setPackageJSONValues(packageJSONPath, { name: 'unset' });
  });

  test('should set dev scripts in package.json', () => {
    const packageJSONPath = path.join(
      __dirname,
      'test-utils',
      'test-package.json'
    );
    const randomPackageName = `test-package-123`;
    setPackageJSONValues(packageJSONPath, {
      name: randomPackageName,
      scripts: {
        dev: 'bunx --bun abell dev',
        generate: 'bunx --bun abell generate'
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJSONContent = require(packageJSONPath);
    expect(packageJSONContent.name).toBe(randomPackageName);
    expect(packageJSONContent.scripts.dev).toBe('bunx --bun abell dev');
    expect(packageJSONContent.scripts.generate).toBe(
      'bunx --bun abell generate'
    );
    expect(packageJSONContent.version).toBe('0.0.15');
    expect(packageJSONContent.description).toBe('test-description');
    setPackageJSONValues(packageJSONPath, {
      name: 'unset',
      scripts: {
        dev: 'abell dev',
        generate: 'abell generate'
      }
    });
  });
});
