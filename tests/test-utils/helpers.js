const fs = require('fs');
const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

const cheerio = require('cheerio');

/**
 * Builds the example
 * @param {String} exampleName Name of the example to build
 */
async function preTestSetup(exampleName) {
  const tempCWD = process.cwd();
  process.chdir(path.join(__dirname, '..', '..'));
  const { stderr, stdout } = await exec(
    `cd examples/${exampleName} && node ../../bin/abell.js build`
  );

  process.chdir(tempCWD);
  if (stderr) throw new Error(stderr);
  if (stdout.includes('Abell Build Failed')) {
    console.log(stdout);
    throw new Error(
      `>> Build Fail for examples/${exampleName}, Scroll up for logs.`
    );
  }
}

/**
 * Returns jQuery Selector for given path
 * @param {String} outPath Path of HTML file
 * @return {Object}
 */
function getSelector(outPath) {
  const htmlTemplate = fs.readFileSync(outPath, 'utf-8');
  const $ = cheerio.load(htmlTemplate);
  return $;
}

/**
 * Returns responsive path that remains same even in windows
 * @param {string} pathString path to the file/folder
 * @return {string}
 */
const resPath = (pathString) => pathString.replace(/\//g, path.sep);

module.exports = {
  resPath,
  preTestSetup,
  getSelector
};
