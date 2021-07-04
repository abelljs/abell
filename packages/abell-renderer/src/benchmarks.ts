import { render } from './index';

const repeat = 1000;

const abellCode = `
<html>
<body>
  {{
    b = 9;
    a = 3;
  }}

  Hello World 

  TEST TEST

  <div>{{ a + b }}</div>
  <Nice/>
</body>
</html>
`.repeat(repeat);

let oldParserExecutionTime;
let newParserExecutionTime;

{
  const startTime = new Date().getTime();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const finalCode = render(
    abellCode,
    {},
    { allowComponents: false, useNewCompiler: true }
  );
  const executionTime = new Date().getTime() - startTime;
  newParserExecutionTime = executionTime;
}

{
  const startTime = new Date().getTime();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const finalCode = render(abellCode, {}, { allowComponents: false });
  const executionTime = new Date().getTime() - startTime;
  oldParserExecutionTime = executionTime;
}

console.log(`Time taken by abell-renderer to execute ${repeat * 2} JS blocks`);
console.table({
  ['Old Parser']: `${oldParserExecutionTime}ms`,
  ['New Parser']: `${newParserExecutionTime}ms`
});
