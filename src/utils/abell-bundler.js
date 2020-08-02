const fs = require('fs');
const path = require('path');

const { addToHeadEnd, addToBodyEnd } = require('./general-helpers.js');
const { createPathIfAbsent } = require('./abell-fs.js');

let currentBundledCSS = {}; // stores map of css files as they are bundled
let currentBundledJS = {}; // stores map of js files as they are bundled

/**
 * Clears bundle cache. (Used in abell serve)
 */
function clearBundleCache() {
  currentBundledCSS = {};
  currentBundledJS = {};
}

/**
 * Recursive function that unwraps components and adds them to respective files
 * @param {Object} components Array of all components
 * @param {String} parentPath Path of parent
 * @param {Array} prev Holds previous array for recursion
 * @return {Array}
 */
function getComponentBundles(
  components,
  parentPath,
  prev = { inlinedStyles: '', inlinedScripts: '' }
) {
  if (components.length <= 0) {
    return prev;
  }

  let out = [];

  for (const component of components) {
    for (const style of component.styles) {
      let bundlePath;
      if (style.attributes.inlined === true) {
        bundlePath = 'inlinedStyles-' + parentPath;
      } else if (style.attributes.bundle) {
        bundlePath = path.join('bundled-css', style.attributes.bundle);
      } else {
        bundlePath = path.join('bundled-css', 'main.abell.css');
      }

      const alreadyBundledInfo = currentBundledCSS[style.componentPath];

      if (alreadyBundledInfo && alreadyBundledInfo === bundlePath) {
        // style is already bundled
        style.content = '';
      } else {
        currentBundledCSS[style.componentPath] = bundlePath;
      }

      if (!prev[bundlePath]) {
        prev[bundlePath] = '';
      }
      prev[bundlePath] += style.content;
    }

    for (const script of component.scripts) {
      let bundlePath;
      if (script.attributes.inlined === true) {
        bundlePath = 'inlinedScripts-' + parentPath;
      } else if (script.attributes.bundle) {
        bundlePath = path.join('bundled-js', script.attributes.bundle);
      } else {
        bundlePath = path.join('bundled-js', 'main.abell.js');
      }

      const alreadyBundledInfo = currentBundledJS[script.componentPath];

      if (alreadyBundledInfo && alreadyBundledInfo === bundlePath) {
        // script is already bundled
        script.content = '';
      } else {
        currentBundledJS[script.componentPath] = bundlePath;
      }

      if (!prev[bundlePath]) {
        prev[bundlePath] = '';
      }
      prev[bundlePath] += script.content;
    }

    out = { ...getComponentBundles(component.components, parentPath, prev) };
  }

  return out;
}

/**
 * Adds all files from bundleMap to respective files
 * @param {Object} options
 * @param {String} options.htmlOut HTML text input
 * @param {String} options.outPath Output path of HTML file
 * @param {Object} options.components Tree of components, retured from abell-renderer
 * @param {Object} options.parentPath Path of parent abell file
 * @param {ProgramInfo} options.programInfo
 * @return {String}
 */
function createBundles({
  htmlOut,
  outPath,
  components,
  parentPath,
  programInfo
}) {
  const bundleMap = getComponentBundles(components, parentPath);
  for (let [bundlePath, bundleContent] of Object.entries(bundleMap)) {
    if (!bundleContent.trim()) {
      continue;
    }
    if (bundlePath.startsWith('inlinedStyles')) {
      // inline the bundleContent inside HTML in style
      htmlOut = addToHeadEnd(`\n<style>${bundleContent}</style>\n`, htmlOut);
    } else if (bundlePath.startsWith('inlinedScripts')) {
      // inline the bundleContent in HTML in script
      htmlOut = addToBodyEnd(`<script>${bundleContent}</script>`, htmlOut);
    } else {
      bundlePath = path.join(programInfo.abellConfig.outputPath, bundlePath);
      createPathIfAbsent(path.dirname(bundlePath));
      // append bundleContent into bundlePath and add <script src> or <style href> depending on extension
      if (fs.existsSync(bundlePath)) {
        fs.appendFileSync(bundlePath, bundleContent);
      } else {
        fs.writeFileSync(bundlePath, bundleContent);
      }
    }
  }

  const cssLinks = Object.keys(bundleMap)
    .filter((filePath) => filePath.endsWith('.css'))
    .map(
      (filePath) =>
        `\n<link rel="stylesheet" href="${path.relative(
          path.dirname(outPath),
          path.join(programInfo.abellConfig.outputPath, filePath)
        )}"/>\n`
    );

  const jsLinks = Object.keys(bundleMap)
    .filter((filePath) => filePath.endsWith('.js'))
    .map(
      (filePath) =>
        `\n<script src="${path.relative(
          path.dirname(outPath),
          path.join(programInfo.abellConfig.outputPath, filePath)
        )}"></script>\n`
    );

  htmlOut = addToBodyEnd(jsLinks.join('\n'), htmlOut);
  htmlOut = addToHeadEnd(cssLinks.join('\n'), htmlOut);
  return htmlOut;
}

module.exports = { createBundles, clearBundleCache };
