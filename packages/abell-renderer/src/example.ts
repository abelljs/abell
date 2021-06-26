import { render } from './index';

// const abellString = `
// {{
//   const a = 3;
//   const b = 9;
// }}

// <b>{{ a + b }}</b>
// `;

// const htmlString = render(abellString, {}, { allowComponents: false });
// console.log(htmlString);
import parser, { getOutputCode } from './parsers/htmlparser2-test';

const startTime = new Date().getTime();

const abellComponentString = `
<html>
<body>
  {{
    a = 3;
    b = 9;
  }}

  Hello World 

  hEHEHE niceee!

  <div class="hello" id="hehe">{{ a + b }}</div>
</body>
</html>
`;

parser.write(abellComponentString.repeat(1));
// render(abellComponentString.repeat(10000), {});
console.log(getOutputCode());

// console.log(render(abellComponentString.repeat(1000), {}));

const executionTime = new Date().getTime() - startTime;
console.log(executionTime);
