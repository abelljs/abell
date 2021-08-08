export type UserOptionsBase = Partial<{
  baseWorkingDirectory: string;
  basePath: string;
  filename: string;
  dangerouslyAllowRequire: boolean;
  allowComponents: boolean;
}>;

export interface UserOptionsAllowComponents extends UserOptionsBase {
  allowComponents: true;
}

export type UserOptions = UserOptionsAllowComponents | UserOptionsBase;

export type ContentBundle = {
  attributes: Record<string, unknown>;
  componentName: string;
  componentPath: string;
  content: string;
};

export interface StyleScriptsBundleInfo {
  styles: ContentBundle[];
  scripts: ContentBundle[];
  components?: StyleScriptsBundleInfo[];
  componentName: string;
  componentPath: string;
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
