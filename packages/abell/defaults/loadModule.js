/**
 * Not exactly a default. Just wanted to move it out of TypeScript compilation so that it doesn't transpile `import` to `require`.
 *
 * TLDR: ESM in Node is pain
 */
const loadModule = (id) => import(id);
module.exports = loadModule;
module.exports.loadModule = loadModule;
