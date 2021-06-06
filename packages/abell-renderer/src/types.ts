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

export type AbellComponentMap = {
  html: string;
  components?: Array<AbellComponentMap>;
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
