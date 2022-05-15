type RenderContext = Record<string, unknown>;

export type Route = {
  path: string;
  render: (ctx?: RenderContext) => string | undefined;
};

export type StyleTagAttributes = Record<string, string | boolean>;
export type CSSBlockType = {
  text: string;
  attributes: StyleTagAttributes;
};

export type AbstractSyntaxArrayType = {
  declarationsBlock: { text: string };
  cssBlocks: CSSBlockType[];
  out: {
    text: string;
    blocks: { text: string }[];
  };
};
