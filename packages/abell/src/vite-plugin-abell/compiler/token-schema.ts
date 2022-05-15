export const tokenSchema = {
  ESCAPED_BLOCK_START: /\\{{/,
  STYLE_START: /<style(.*?)>/,
  STYLE_END: /<\/style>/,
  BLOCK_START: /{{/,
  BLOCK_END: /}}/
};

export type TokenSchemaType = typeof tokenSchema;
