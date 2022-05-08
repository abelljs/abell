/* eslint-disable max-len */
import path from 'path';
import { describe, test, expect } from 'vitest';
import { setNameInPackageJSON } from '../steps';

function getRandomNumberBetween1and100() {
  return Math.floor(Math.random() * 100) + 1;
}

describe('setNameInPackageJSON', () => {
  test('should set the name in package.json', () => {
    const packageJSONPath = path.join(
      __dirname,
      'test-utils',
      'test-package.json'
    );
    const randomPackageName = `test-package-${getRandomNumberBetween1and100()}`;
    setNameInPackageJSON(packageJSONPath, randomPackageName);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJSONContent = require(packageJSONPath);
    expect(packageJSONContent.name).toBe(randomPackageName);
    expect(packageJSONContent.version).toBe('0.0.15');
    expect(packageJSONContent.description).toBe('test-description');
  });
});
