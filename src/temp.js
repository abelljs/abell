const unified = require('unified');
const rehypeParser = require('rehype-parse');
const util = require('util');
const select = require('hast-util-select').select;

const htmlText = `
  <div class="hi">Hi <span class="cool">nice</span> </div>
`

const logTree = objToLog => console.log(util.inspect(objToLog, {showHidden: false, depth: null}))


const tree = unified().use(rehypeParser).parse(htmlText);
const niceSpan = select('.cool', tree);
console.log(niceSpan)