import vm from 'vm';
import abellRenderer from './index';
import abellParser from './parsers/abell-parser';

const abellCode = `
  <html>
    <body>
      {{
        const a = 3;
        const b = 12;
      }}
      <div>{{ a + b }}</div>
      <Hello />
    </body>
  </html>
`;

// const jsCode = `a = 4`;
// console.log(abellParser.runJS(jsCode, vm.createContext({}), 0, {}));

// TODO: set up script to run this example
const finalCode = abellRenderer.render(
  abellCode,
  {},
  {
    useNewCompiler: true,
    allowComponents: true
  }
);
console.log(finalCode);
