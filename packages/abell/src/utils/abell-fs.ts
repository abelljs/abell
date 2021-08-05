import fs from 'fs';
import path from 'path';

export const standardizePath = (osPath: string): string =>
  osPath.replace(/\\/g, '/');

/**
 * Removes the folder
 */
export function rmdirRecursiveSync(pathToRemove: string): void {
  if (fs.existsSync(pathToRemove)) {
    fs.readdirSync(pathToRemove).forEach((file) => {
      const curPath = path.join(pathToRemove, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        rmdirRecursiveSync(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToRemove);
  }
}

/**
 * Recursively finds a file with given extension
 */
export function recursiveFindFiles(
  base: string,
  ext: '.abell' | '.html',
  inputFiles: string[] | undefined = undefined,
  inputResult: string[] | undefined = undefined
): string[] {
  const files = inputFiles || fs.readdirSync(base);
  let result = inputResult || [];

  for (const file of files) {
    const newbase = path.join(base, file);
    if (fs.statSync(newbase).isDirectory()) {
      result = recursiveFindFiles(
        newbase,
        ext,
        fs.readdirSync(newbase),
        result
      );
    } else {
      if (file.endsWith(ext)) {
        result.push(newbase);
      }
    }
  }

  return result;
}

/**
 * Create directories recursively if not present
 */
export function createPathIfAbsent(pathToCreate: string): void {
  pathToCreate.split(path.sep).reduce((prevPath, folder) => {
    const currentPath = path.join(prevPath, folder, path.sep);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
    return currentPath;
  }, '');
}
