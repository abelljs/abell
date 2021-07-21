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

export interface StyleScriptsBundleInfo {
  styles?: {
    attributes: Array<string>;
    component: string;
    componentPath: string;
    content: string;
  };
  scripts?: {
    attributes: Array<string>;
    component: string;
    componentPath: string;
    content: string;
  };
  components?: StyleScriptsBundleInfo[];
}

export type OutputWithComponent = {
  html: string;
  components?: StyleScriptsBundleInfo[];
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
