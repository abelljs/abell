import path from 'path';

export const BASE_PATH = path.join(__dirname, 'test-files');
export const prefix = (fileName: string, baseOverride?: string): string =>
  path.join(baseOverride ?? BASE_PATH, fileName);
