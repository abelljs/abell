/* eslint-disable max-len */
import { compile, getStatementTypeMap } from '../../compiler/compiler';

describe('compile() - Executes JavaScript passed to it as string', () => {
  it('should output added value when addition is performed on two values', () => {
    expect(compile('{{ 24 + 12 }}', {}, { filename: 'execute.spec.js' })).toBe(
      '36'
    );
  });

  it('should update value of a to new value', () => {
    expect(
      compile(
        '{{ a = 22 + 22 }} {{ a }}',
        { a: 4 },
        {
          filename: 'execute.spec.js'
        }
      ).trim()
    ).toBe('44');
  });

  it('should not update value that is inside string', () => {
    expect(
      compile("{{ (() => 'a = b')() }}", {}, { filename: 'execute.spec.js' })
    ).toBe('a = b');
  });
});

describe('getStatementMap() - Returns an array of top-level statement types', () => {
  it('should return correct types for variable declarations, and assignments', () => {
    const example = `
    const a = 3;
    const b = 5;
    {
      const c = 'hello';
    }var d = 9;e = 10;
    c;d+=10;e-=5;
    b + 9;
    [1, 2, 3].map(val => {
      const multiplier = 2;
      return val*multiplier;
    })
    `;

    expect(getStatementTypeMap(example)).toEqual([
      'VariableDeclaration',
      'VariableDeclaration',
      'BlockStatement',
      'VariableDeclaration',
      'AssignmentExpression',
      'ExpressionStatement',
      'AssignmentExpression',
      'AssignmentExpression',
      'ExpressionStatement',
      'ExpressionStatement'
    ]);
  });
});
