import { describe, expect, test } from 'vitest';
import tokenize from './generic-tokenizer.js';
import { tokenSchema } from './token-schema.js';

describe('tokenize', () => {
  test("should return token that matches abell's schema", () => {
    const abellCode = `
    <h1>{{ 2 + 3 }}</h1>
    {{
      /* @declaration */
      const a = 3;
      const b = 9;
    }}
    `;
    const tokens = tokenize(abellCode, tokenSchema, 'default');
    expect(tokens).toMatchInlineSnapshot(`
      [
        {
          "text": "
          <h1>",
          "type": "default",
        },
        {
          "col": 9,
          "line": 2,
          "matches": [],
          "pos": 9,
          "text": "{{",
          "type": "BLOCK_START",
        },
        {
          "text": " 2 + 3 ",
          "type": "default",
        },
        {
          "col": 18,
          "line": 2,
          "matches": [],
          "pos": 18,
          "text": "}}",
          "type": "BLOCK_END",
        },
        {
          "text": "</h1>
          ",
          "type": "default",
        },
        {
          "col": 5,
          "line": 3,
          "matches": [],
          "pos": 30,
          "text": "{{",
          "type": "BLOCK_START",
        },
        {
          "text": "
            /* @declaration */
            const a = 3;
            const b = 9;
          ",
          "type": "default",
        },
        {
          "col": 5,
          "line": 7,
          "matches": [],
          "pos": 100,
          "text": "}}",
          "type": "BLOCK_END",
        },
        {
          "text": "
          ",
          "type": "default",
        },
      ]
    `);
  });
});
