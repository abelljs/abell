declare module '*.mdx' {
  const value: string;
  export default value;
}

declare module 'react?server' {
  import * as all from 'react';
  export = all;
}

declare module 'vite-plugin-md-to-html?server' {
  import * as all from 'vite-plugin-md-to-html';
  export = all;
}
