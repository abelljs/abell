const fs = require('fs');
const path = require('path');

const { addToHeadEnd, addToBodyEnd } = require('./general-helpers.js');
const { createPathIfAbsent } = require('./abell-fs.js');

let currentBundledCSS = {}; // stores map of css files as they are bundled
let currentBundledJS = {}; // stores map of js files as they are bundled

/**
 * Clears bundle cache. (Used in abell serve)
 * @param {Object} options
 * @param {String} options.ofBundle
 * @return {Object}
 */
function clearBundleCache({ ofBundle } = {}) {
  if (ofBundle) {
    Object.entries(currentBundledCSS).forEach(([key, cssKeys]) => {
      const notInlinedStyles = cssKeys.filter(
        (cssKey) => !cssKey.startsWith('inlinedStyles-' + ofBundle)
      );

      if (notInlinedStyles.length <= 0) {
        delete currentBundledCSS[key];
      } else {
        currentBundledCSS[key] = notInlinedStyles;
      }
    });

    Object.entries(currentBundledJS).forEach(([key, jsKeys]) => {
      const notInlinedScipts = jsKeys.filter(
        (jsKey) => !jsKey.startsWith('inlinedScripts-' + ofBundle)
      );

      if (notInlinedScipts.length <= 0) {
        delete currentBundledJS[key];
      } else {
        currentBundledJS[key] = notInlinedScipts;
      }
    });

    return { currentBundledCSS, currentBundledJS };
  }

  currentBundledCSS = {};
  currentBundledJS = {};

  return { currentBundledCSS, currentBundledJS };
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
  prev = {
    inlinedStyles: { content: '', path: '' },
    inlinedScripts: { content: '', path: '' }
  }
) {
  if (components.length <= 0) {
    return prev;
  }

  let out = [];

  for (const component of components) {
    for (const styleIndex in component.styles) {
      const style = component.styles[styleIndex];
      let bundleKey;
      if (style.attributes.inlined === true) {
        bundleKey = 'inlinedStyles-' + parentPath + '-' + styleIndex;
      } else if (style.attributes.bundle) {
        bundleKey =
          path.join('bundled-css', style.attributes.bundle) + '-' + styleIndex;
      } else {
        bundleKey =
          path.join('bundled-css', 'main.abell.css') + '-' + styleIndex;
      }

      const alreadyBundledInfo = currentBundledCSS[style.componentPath];

      if (
        alreadyBundledInfo !== undefined &&
        alreadyBundledInfo.includes(bundleKey)
      ) {
        // style is already bundled
        style.content = '';
      } else {
        if (alreadyBundledInfo === undefined) {
          currentBundledCSS[style.componentPath] = [];
        }
        currentBundledCSS[style.componentPath].push(bundleKey);
      }

      if (!prev[bundleKey]) {
        prev[bundleKey] = { content: '' };
      }
      prev[bundleKey].path = bundleKey.slice(0, bundleKey.lastIndexOf('-'));
      prev[bundleKey].content += style.content;
    }

    for (const scriptIndex in component.scripts) {
      const script = component.scripts[scriptIndex];
      let bundleKey;
      if (script.attributes.inlined === true) {
        bundleKey = 'inlinedScripts-' + parentPath + '-' + scriptIndex;
      } else if (script.attributes.bundle) {
        bundleKey =
          path.join('bundled-js', script.attributes.bundle) + '-' + scriptIndex;
      } else {
        bundleKey =
          path.join('bundled-js', 'main.abell.js') + '-' + scriptIndex;
      }

      const alreadyBundledInfo = currentBundledJS[script.componentPath];

      if (
        alreadyBundledInfo !== undefined &&
        alreadyBundledInfo.includes(bundleKey)
      ) {
        // script is already bundled
        script.content = '';
      } else {
        if (alreadyBundledInfo === undefined) {
          currentBundledJS[script.componentPath] = [];
        }
        currentBundledJS[script.componentPath].push(bundleKey);
      }

      if (!prev[bundleKey]) {
        prev[bundleKey] = { content: '' };
      }

      prev[bundleKey].path = bundleKey.slice(0, bundleKey.lastIndexOf('-'));
      prev[bundleKey].content += script.content;
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
 * @param {ProgramInfo} options.programInfo
 * @return {String}
 */
function createBundles({ htmlOut, outPath, components, programInfo }) {
  const parentPath = path.relative(programInfo.abellConfig.outputPath, outPath);
  const bundleMap = getComponentBundles(components, parentPath);
  for (const bundle of Object.values(bundleMap)) {
    const bundleContent = bundle.content;
    let bundlePath = bundle.path;
    if (!bundleContent.trim()) {
      continue;
    }
    /** TODO: Not working for bundled styles */
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

  const addedLinks = [];
  const cssLinks = Object.values(bundleMap)
    .filter((bundle) => bundle.path.endsWith('.css'))
    .map((bundle) => {
      if (addedLinks.includes(bundle.path)) {
        return '';
      }

      addedLinks.push(bundle.path);
      return `\n<link rel="stylesheet" href="${path.relative(
        path.dirname(outPath),
        path.join(programInfo.abellConfig.outputPath, bundle.path)
      )}"/>\n`;
    });

  const jsLinks = Object.values(bundleMap)
    .filter((bundle) => bundle.path.endsWith('.js'))
    .map((bundle) => {
      if (addedLinks.includes(bundle.path)) {
        return '';
      }

      addedLinks.push(bundle.path);
      return `\n<script src="${path.relative(
        path.dirname(outPath),
        path.join(programInfo.abellConfig.outputPath, bundle.path)
      )}"></script>\n`;
    });

  htmlOut = addToBodyEnd(jsLinks.join('\n'), htmlOut);
  htmlOut = addToHeadEnd(cssLinks.join('\n'), htmlOut);
  return htmlOut;
}

module.exports = { createBundles, clearBundleCache, getComponentBundles };
