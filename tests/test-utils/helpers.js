const fs = require('fs');
const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

const cheerio = require('cheerio');
const { execRegexOnAll } = require('../../src/utils/general-helpers');

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
 * Transforms hash like snkajda to 1, 2, 3 like numbers
 * @param {string} content style content
 * @return {string}
 */
function transformHash(content) {
  let newContent = '';
  let currentNum = 0;
  let lastIndex = 0;
  const hashes = {};

  const { matches } = execRegexOnAll(/\[data-abell-(.*?)\]/g, content);
  for (const match of matches) {
    if (!hashes[match[1]]) {
      hashes[match[1]] = ++currentNum;
    }
    // prettier-ignore
    // eslint-disable-next-line max-len
    newContent += `${content.slice(lastIndex, match.index)}[data-abell-${currentNum}]`;
    lastIndex = match.index + match[0].length;
  }

  newContent += content.slice(lastIndex);
  return newContent.trim().replace(/\r/g, '');
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
  transformHash,
  getSelector
};
