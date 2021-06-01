export type UserOptions = {
  basePath?: string;
  filename?: string;
  allowRequire?: boolean;
  allowComponents?: boolean;
};

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
