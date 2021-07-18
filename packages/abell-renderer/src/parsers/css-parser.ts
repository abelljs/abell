import * as stylis from 'stylis';
import selectorParser from 'postcss-selector-parser';

export const ABELL_CSS_DATA_PREFIX = 'data-abell';

// mostly taken from https://github.com/vuejs/component-compiler-utils/blob/master/lib/stylePlugins/scoped.ts
// Removed some vue specific features
const cssSelectorTransformer = (scopingAttribute: string) => {
  return selectorParser((selectors) => {
    selectors.each((selector) => {
      let node = null;

      // find the last child node to insert attribute selector
      selector.each((n) => {
        if (n.type !== 'pseudo' && n.type !== 'combinator') {
          node = n;
        }
      });

      if (node) {
        node.spaces.after = '';
      } else {
        // For deep selectors & standalone pseudo selectors,
        // the attribute selectors are prepended rather than appended.
        // So all leading spaces must be eliminated to avoid problems.
        selector.first.spaces.before = '';
      }

      selector.insertAfter(
        node,
        selectorParser.attribute({
          attribute: scopingAttribute
        })
      );
    });
  });
};

const generateScopedSelector = (selector, attribute) =>
  cssSelectorTransformer(attribute).processSync(selector);

const selectorPrefixer = (hash) => (element) => {
  // rule is the AST node which has the css selector
  if (element.type === 'rule') {
    // map over each existing select and prefix it
    const newSelectors = element.props.map((selector) => {
      return generateScopedSelector(
        selector,
        `${ABELL_CSS_DATA_PREFIX}-${hash}`
      );
    });
    // Mutate the old ast node with the new selectors
    element.props = newSelectors;
  }
};

export const cssSerializer = (cssString, hash) => {
  return stylis.serialize(
    stylis.compile(cssString),
    stylis.middleware([selectorPrefixer(hash), stylis.stringify])
  );
};
