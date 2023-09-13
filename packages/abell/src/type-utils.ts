import type {
  EsbuildTransformOptions,
  UserConfig as ViteUserConfig
} from 'vite';

type RenderContext = Record<string, unknown>;

export type Route = {
  path: string;
  render: (ctx?: RenderContext) => string | undefined;
  routeOptions?: {
    outputPathPattern?: '[route]/index.html' | '[route].html';
  };
};

export type StyleTagAttributes = Record<string, string | boolean>;
export type CSSBlockType = {
  text: string;
  attributes: StyleTagAttributes;
};

export type AbstractSyntaxArrayType = {
  declarationBlocks: { text: string };
  importBlock: { text: string };
  cssBlocks: CSSBlockType[];
  out: {
    text: string;
    blocks: { text: string }[];
  };
};

export type AbellOptions = {
  /**
   * This is configurations for the esbuild that transforms internal abell blocks.
   *
   * E.g. if you want to use JSX in abell blocks, you can override loader of esbuild here
   * ```js
   * abell: {
   *  esbuild: {
   *    loader: 'jsx'
   *  }
   * }
   * ```
   */
  esbuild?: EsbuildTransformOptions;
  /**
   * Just like "build" option in Vite. Except this only applies on intermediate server build that is created.
   *
   * You can use this to change config of build-time things.
   *
   * E.g. if you want to use top-level await in entry.build.ts, you can set target here without having to change target of your final client bundle
   */
  serverBuild?: ViteUserConfig['build'];
};

export interface AbellViteConfig extends ViteUserConfig {
  abell?: AbellOptions;
}
