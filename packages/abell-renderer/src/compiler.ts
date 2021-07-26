import * as vm from 'vm';
import * as acorn from 'acorn';
import { UserOptions, AcornNode } from './types';
import tokenize from './utils/generic-tokenizer';

export function validateAbellBlock(
  statementTypeMap: string[],
  jsCode: string,
  filename: string
): void {
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

export function getStatementTypeMap(jsCode: string): string[] {
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

const tokenSchema = {
  COMMENTED_OUT_BLOCK_START: /\\{{/,
  BLOCK_START: /{{/,
  BLOCK_END: /}}/,
  SELF_CLOSING_COMPONENT_TAG:
    // eslint-disable-next-line max-len
    /<([A-Z][a-zA-Z0-9]*)[ \n]*?(?:data-abell-[a-zA-Z0-9]*?)?(?:props={(?<props>.*?)})?[ \n]*?\/>/,
  NEW_LINE: /\n/
};

export function compile(
  abellTemplate: string,
  sandbox: Record<string, unknown>,
  options: UserOptions
): string {
  const tokens = tokenize(abellTemplate, tokenSchema, 'default');

  let finalCode = '';
  let jsCodeContext = '';
  let isInsideAbellBlock = false;
  let currentLineNumber = 0;
  let blockLineNumber = 0;
  const context: vm.Context = vm.createContext(sandbox); // eslint-disable-line
  for (const token of tokens) {
    if (token.type === 'BLOCK_START') {
      // abell block starts ({{)
      isInsideAbellBlock = true;
      blockLineNumber = 0;
      continue;
    } else if (token.type === 'COMMENTED_OUT_BLOCK_START') {
      finalCode += token.text.replace(/\\/g, '');
    } else if (token.type === 'BLOCK_END') {
      // abell block ends (}})
      if (isInsideAbellBlock) {
        isInsideAbellBlock = false;
        const jsOutput = runJS(
          jsCodeContext,
          context,
          currentLineNumber,
          options
        );
        jsCodeContext = ''; // set context empty since the code is executed now
        currentLineNumber += blockLineNumber; // include new lines from inside the js block
        blockLineNumber = 0;
        finalCode += jsOutput;
      } else {
        // This means that the block was never opened.
        // For scenarios like `234 }}`
        finalCode += token.text;
      }
    } else if (token.type === 'NEW_LINE') {
      if (isInsideAbellBlock) {
        blockLineNumber += 1;
      } else {
        currentLineNumber += 1;
        finalCode += token.text;
      }
    } else if (token.type === 'SELF_CLOSING_COMPONENT_TAG') {
      if (!token.matches) {
        throw new Error("[abell-renderer]: Couldn't parse self closing tag");
      }
      const [tagName, props] = token.matches;
      const tagProps = props ? `{${props}}` : '';
      const transpiledTag = `${tagName}(${tagProps}).html`;
      const jsOutput = runJS(
        transpiledTag,
        context,
        currentLineNumber,
        options
      );
      finalCode += jsOutput;
    } else if (!isInsideAbellBlock) {
      // the code outside abell block that goes directly into output
      finalCode += token.text;
    }

    if (isInsideAbellBlock) {
      // inside the abell block
      // add to jsContext instead of final output
      jsCodeContext += token.text;
    }
  }

  return finalCode;
}
