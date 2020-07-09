/**
 * We use remarkable to parse markdown to HTML.
 *
 * This plugin adds id attribute to headlines in markdown.
 *
 */

/**
 * Turns 'Hello World' to 'hello-world'
 * @param {String} headerContent
 * @return {String}
 */
function toSlug(headerContent) {
  return headerContent
    .toLowerCase()
    .replace(
      /[\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\{\|\}\~\-]/g,
      ''
    )
    .replace(/\s/g, '-');
}

/**
 * @param {Object} md
 */
function anchors(md) {
  md.renderer.rules.heading_open = function (tokens, idx) {
    return `<h${tokens[idx].hLevel} id="${toSlug(tokens[idx + 1].content)}">`;
  };
}

module.exports = anchors;
