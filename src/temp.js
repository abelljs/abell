const unified = require('unified');
const rehypeParser = require('rehype-parse');
const util = require('util');

const htmlText = `
  <div>Hi <span>nice</span> </div>
`

const logTree = objToLog => console.log(util.inspect(objToLog, {showHidden: false, depth: null}))


const tree = unified().use(rehypeParser).parse(htmlText);
logTree(tree);