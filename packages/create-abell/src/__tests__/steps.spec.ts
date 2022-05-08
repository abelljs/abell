/* eslint-disable max-len */
import path from 'path';
import { describe, test, expect } from 'vitest';
import { setNameInPackageJSON } from '../steps';

describe('setNameInPackageJSON', () => {
  test('should set the name in package.json', () => {
    const packageJSONPath = path.join(
      __dirname,
      'test-utils',
      'test-package.json'
    );
    const randomPackageName = `test-package-123`;
    setNameInPackageJSON(packageJSONPath, randomPackageName);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJSONContent = require(packageJSONPath);
    expect(packageJSONContent.name).toBe(randomPackageName);
    expect(packageJSONContent.version).toBe('0.0.15');
    expect(packageJSONContent.description).toBe('test-description');
    setNameInPackageJSON(packageJSONPath, 'unset');
  });
});
