declare module '*.mdx' {
  const value: string;
  export default value;
}

declare module 'react?server' {
  import * as all from 'react';
  export = all;
}
