/// <reference lib="vite/client"/>

declare module '*.abell' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const html: (props?: Record<string, unknown>) => string;
  export default html;
}
