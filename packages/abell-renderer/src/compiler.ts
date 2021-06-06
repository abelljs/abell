import * as vm from 'vm';
import * as acorn from 'acorn';
import { UserOptions, AcornNode } from './types';
import { execRegexOnAll } from './utils';

function validateAbellBlock(
  statementTypeMap: string[],
  jsCode: string,
  filename: string
) {
  if (
    !statementTypeMap.includes('VariableDeclaration') &&
    !statementTypeMap.includes('AssignmentExpression') &&
    statementTypeMap.length > 1
  ) {
    console.log('\nWARNING:');
    console.log('{{\n>' + jsCode + '\n}}');
    console.log(
      'SYNTAX WARN: An Abell Block should not have multiple expressions that output values', // eslint-disable-line
      filename
    );
  }
}

function getStatementTypeMap(jsCode: string): string[] {
  /**
   * TODO:
   * Remove things from curly brackets {} in jsCode string since they are
   * anyway counted as a BlockStatement directly.
   */

  try {
    // For some reason, acorn's typechecking is wrong. Have to do this hack
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ast = acorn.parse(jsCode, { ecmaVersion: 2020 }).body;

    return ast.map((astNode: AcornNode) => {
      if (
        astNode.type === 'ExpressionStatement' &&
        astNode.expression.type === 'AssignmentExpression'
      ) {
        return 'AssignmentExpression';
      }

      return astNode.type;
    });
  } catch (err) {
    // errors are caught by the vm module so we let code continue anyway
    return ['ExpressionStatement'];
  }
}

function runJS(
  jsCode: string,
  context: vm.Context,
  errLineOffset: number,
  options: UserOptions
): string {
  const statementTypeMap = getStatementTypeMap(jsCode);
  validateAbellBlock(
    statementTypeMap,
    jsCode,
    `${options.filename}:${errLineOffset + 1}`
  );

  const script = new vm.Script(jsCode, {
    filename: options.filename,
    lineOffset: errLineOffset
  });

  const jsOutput = script.runInContext(context, {
    displayErrors: true
  });

  if (
    statementTypeMap[statementTypeMap.length - 1] === 'AssignmentExpression'
  ) {
    // for {{ a = 3 }} it should not print anything so we return blank string
    return '';
  }

  if (jsOutput === undefined || jsOutput === null) {
    return '';
  }

  if (typeof jsOutput === 'function') {
    return jsOutput();
  }

  if (Array.isArray(jsOutput)) {
    return jsOutput.join('');
  }

  return jsOutput;
}

export function compile(
  abellTemplate: string,
  sandbox: Record<string, unknown>,
  options: UserOptions
): string {
  const context: vm.Context = vm.createContext(sandbox); // eslint-disable-line

  const { matches, input } = execRegexOnAll(/\\?{{(.+?)}}/gs, abellTemplate);
  let renderedHTML = '';
  let lastIndex = 0;

  for (const match of matches) {
    const [abellBlock, jsCode] = match;
    let evaluatedValue = '';
    const errLineOffset = (input.slice(0, match.index).match(/\n/g) || [])
      .length;

    if (abellBlock.startsWith('\\{{')) {
      // if block is comment (e.g \{{ I want to print this as it is }})
      evaluatedValue = abellBlock.slice(1);
    } else {
      evaluatedValue = runJS(jsCode, context, errLineOffset, options);
    }

    const toAddOnIndex = match.index; // Gets the index where the executed value is to be put.
    renderedHTML +=
      input.slice(lastIndex, toAddOnIndex) + String(evaluatedValue).trim();
    lastIndex = toAddOnIndex + abellBlock.length;
  }

  renderedHTML += input.slice(lastIndex);

  return renderedHTML;
}

export default {
  compile,
  runJS
};
