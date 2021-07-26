export type UserOptionsBase = {
  basePath?: string;
  filename?: string;
  allowRequire?: boolean;
  allowComponents?: boolean;
};

export interface UserOptionsAllowComponents extends UserOptionsBase {
  allowComponents: true;
}

export type UserOptions = UserOptionsAllowComponents | UserOptionsBase;

export type ContentBundle = {
  attributes: Record<string, unknown>;
  component: string;
  componentPath: string;
  content: string;
};

export interface StyleScriptsBundleInfo {
  styles: ContentBundle[];
  scripts: ContentBundle[];
  components?: StyleScriptsBundleInfo[];
  component: string;
  filepath: string;
}

export type OutputWithComponent = {
  html: string;
  components: StyleScriptsBundleInfo[];
};

export type NodeBuiltins = {
  console: {
    log: Console['log'];
  };
  __filename?: string;
  __dirname?: string;
  require?: (pathToRequire: string) => unknown;
};

// Acorn TS Hack (I hate myself for doing this)

export interface AcornNode extends acorn.Node {
  body: AcornNode[];
  expression: AcornNode;
}
