type RenderContext = Record<string, unknown>;

export type Route = {
  path: string;
  render: (ctx?: RenderContext) => string | undefined;
};
