// eslint-disable-next-line
export const abellHighlighter = (e: any) => {
  return {
    name: 'abell',
    aliases: ['Abell', 'abell'],
    subLanguage: ['xml'],
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        className: 'abell',
        begin: '{{',
        end: '}}',
        subLanguage: ['javascript', 'xml'],
        contains: [
          {
            className: 'abell',
            begin: '/* html */ `',
            end: '`',
            subLanguage: ['xml']
          }
        ]
      }
    ]
  };
};
