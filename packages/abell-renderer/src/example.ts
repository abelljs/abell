import abellRenderer from './index';

const abellCode = `
  <html>
    <body>
      {{
        const a = 3;
        const b = 12;
      }}
      <div>\\{{ a + b }}</div>
      <Hello props={x: 'hi'} />
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
    filename: 'example.abell',
    allowComponents: true
  }
);
console.log(finalCode);
