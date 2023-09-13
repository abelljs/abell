declare module '*.mdx' {
  const value: string;
  export default value;
}

declare module 'react?server' {
  import * as all from 'react';
  export = all;
}

// Fallback declaration
// Set "tsserver plugin paths" setting in vscode to "./packages/docs"
// For more accurate types
declare module '*?server';
