const { execRegexOnAll } = require('./helpers.js');

/**
 * Prefetchs links from given template and adds it to next template.
 * @param {Object} options
 * @param {String} options.from String of HTML/Abell template to fetch links from
 * @param {String} options.addTo String of HTML/ABELL template to add prefetch into
 *
 * @return {String}
 */
function prefetchLinksAndAddToPage({ from, addTo }) {
  const pageTemplate = addTo;

  // eslint-disable-next-line
  const regexToFetchPaths = /(?:<link +?rel=["']stylesheet['"] +?href=['"](.*?)['"])|(?:<script +?src=['"](.*?)['"])|(?:<link.+?href=["'](.*?)["'].+?as=["'](.*?)["'])/gs;
  const { matches } = execRegexOnAll(regexToFetchPaths, from);
  const headEndIndex = pageTemplate.indexOf('</head>');
  if (headEndIndex < 0) return pageTemplate; // does not have </head>
  // prettier-ignore
  const newPageTemplate =
    pageTemplate.slice(0, headEndIndex) +
    `  <!-- Abell prefetch -->\n` +
    matches
      .map((link) => {
        let stylesheet;
        let script;
        // stylesheet or script have a value if link is straighforward
        // (e.g <link rel="stylesheet" href="style.css">)
        ([stylesheet, script] = link.slice(1));
        // In some cases, user may have a little trickier links
        // (e.g <link rel="preload" href="next.js" as="script")
        if (!stylesheet && !script) {
          try {
            if (link[4] === 'style' && link[3].includes('.css')) {
              stylesheet = link[3];
            } else if (link[4] === 'script' && link[3].includes('.js')) {
              script = link[3];
            }
          } catch (err) {
            console.log(">> Could not recognize preloads, skipping the option..."); // eslint-disable-line max-len
          }
        }
        if (stylesheet) {
          return `  <link rel="prefetch" href="${stylesheet.replace('../','./')}" as="style" />`; // eslint-disable-line max-len
        } else if (script) {
          return `  <link rel="prefetch" href="${script.replace('../', './')}" as="script" />`; // eslint-disable-line max-len
        }
      })
      .join('\n') +
    '\n\n' +
    pageTemplate.slice(headEndIndex);

  return newPageTemplate;
}

/**
 * Adds right prefix to paths if folder's level is deep
 * @param {String} htmlTemplate
 * @param {String} prefix
 * @return {String}
 */
function addPrefixInHTMLPaths(htmlTemplate, prefix) {
  const { matches, input } = execRegexOnAll(
    / (?:href|src)=["'`](.*?)["'`]/g,
    htmlTemplate
  );

  let output = '';
  let lastIndex = 0;
  for (const match of matches) {
    if (match[1].startsWith('http') || match[1].startsWith('//')) continue;
    const indexToAddOn = match.index + match[0].indexOf(match[1]);
    output += input.slice(lastIndex, indexToAddOn) + prefix + '/';
    lastIndex = indexToAddOn;
  }
  output += input.slice(lastIndex);

  return output;
}

module.exports = {
  prefetchLinksAndAddToPage,
  addPrefixInHTMLPaths
};
