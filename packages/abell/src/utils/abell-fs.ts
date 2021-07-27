import path from 'path';

export const getAbsolutePath = (pathString: string): string =>
  path.join(process.cwd(), pathString);
