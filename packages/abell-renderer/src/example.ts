import vm from 'vm';

import tokenize from './parsers/generic-tokenizer';
import abellHelpers from './parsers/abell-parser';

// import { render } from './index';

// // const abellString = `
// // {{
// //   const a = 3;
// //   const b = 9;
// // }}

// // <b>{{ a + b }}</b>
// // `;

// // const htmlString = render(abellString, {}, { allowComponents: false });
// // console.log(htmlString);
// import parser, { getOutputCode } from './parsers/htmlparser2-test';

const startTime = new Date().getTime();

const abellComponentString = `
<html>
<body>
  {{
    const a = 3;
    const b = 9;
  }}

  Hello World 

  TEST TEST

  <div class="hello" id="hehe">{{ a + b }}</div>
  <Nice/>
</body>
</html>
`;

// parser.write(abellComponentString.repeat(1));
// // render(abellComponentString.repeat(10000), {});
// console.log(getOutputCode());

// // console.log(render(abellComponentString.repeat(1000), {}));

// const executionTime = new Date().getTime() - startTime;
// console.log(executionTime);

// 26th June

const tokenSchema = {
  BLOCK_START: /{{/,
  BLOCK_END: /}}/,
  SELF_CLOSING_COMPONENT_TAG: /\<[A-Z][a-z0-9]*?\/>/
};

const tokens = tokenize(abellComponentString, tokenSchema, 'default');
// console.log(tokens);
let finalCode = '';
let jsCodeContext = '';
let isInsideAbellBlock = false;
const context: vm.Context = vm.createContext({}); // eslint-disable-line
for (const token of tokens) {
  if (token.type === 'BLOCK_START') {
    // abell block starts ({{)
    isInsideAbellBlock = true;
    continue;
  } else if (token.type === 'BLOCK_END') {
    // abell block ends (}})
    isInsideAbellBlock = false;
    const jsOutput = abellHelpers.runJS(jsCodeContext, context, 0, {
      filename: 'example.ts'
    });
    jsCodeContext = ''; // set context empty since the code is executed now
    finalCode += jsOutput;
  } else if (isInsideAbellBlock) {
    // inside the abell block
    // add to jsContext instead of final output
    jsCodeContext += token.text;
  } else {
    // the code outside abell block that goes directly into output
    finalCode += token.text;
  }
}
console.log(finalCode);

const executionTime = new Date().getTime() - startTime;
console.log(executionTime);
