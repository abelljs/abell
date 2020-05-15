
/**
 * Turns 'Hello World' to 'hello-world' 
 * @param {String} headerContent 
 * @return {String}
 */
function toSlug(headerContent) {
  return headerContent
    .toLowerCase()
    .replace(/ /g, '-');
}

/**
 * @param {Object} md
 */
function anchors(md) {
  md.renderer.rules.heading_open = function(tokens, idx) {
    return (
      `<h${tokens[idx].hLevel} id="${toSlug(tokens[idx + 1].content)}">`
    );
  };

  md.renderer.rules.heading_close = function(tokens, idx) {
    return (
      `</h${tokens[idx].hLevel}>`
    );
  };
}

module.exports = anchors;
