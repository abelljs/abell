const fs = require('fs');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const cheerio = require('cheerio');

async function preTestSetup(exampleName) {
  const {stderr, stdout} = await exec(`cd examples/${exampleName} && node ../../bin/abell.js build`);
  if (stderr) throw new Error(stderr);
  if (stdout.includes('Abell Build Failed')) {
    console.log(stdout);
    throw new Error(`>> Build Fail for examples/${exampleName}, Scroll up for logs.`);
  }
}

function getSelector(outPath) {
  const htmlTemplate = fs.readFileSync(outPath, 'utf-8');
  const $ = cheerio.load(htmlTemplate);
  return $;
}

module.exports = {
  preTestSetup,
  getSelector
}