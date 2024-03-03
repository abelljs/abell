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

export type SourceMapObject = { pos?: number; col?: number; line?: number };
export type MapsObject = {
  importTextMap: SourceMapObject[];
  declarationTextMap: SourceMapObject[];
  abellTextMap: SourceMapObject[];
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
  maps: MapsObject;
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
   * Abell uses import hashing to avoid transforming repeated layouts through vite.
   * It instead copy pastes the import URLs from earlier transformed page.
   *
   * Checkout description of this issue to know more https://github.com/abelljs/abell/pull/161#issue-1906511077
   *
   * This is set to true by default and in most cases it should work.
   * This flag is for scenarios where you face some bug due to transformation skips
   * or when you know what you're doing and want to transform every HTML route through Vite
   *
   * @default true
   */
  optimizedTransformations?: boolean;
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
