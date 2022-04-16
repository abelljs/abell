/* eslint-disable @typescript-eslint/no-explicit-any */

/**
  Mostly taken from https://github.com/vuejs/component-compiler-utils/blob/master/lib/stylePlugins/scoped.ts
  Removed some vue specific features.

  The code was contributed by https://github.com/pantharshit00 in legacy abell-renderer repo. 
  I (@saurabhdaware) moved it from abell-renderer to abell repo during TS migration.

  Also, I (saurabh) am sorry for lots of `any`s in this file. The code is confusing and I didn't really have time to fix all the ts errors tbh
 */

import * as stylis from 'stylis';
import selectorParser from 'postcss-selector-parser';

export const ABELL_CSS_DATA_PREFIX = 'data-abell';

/** */
const cssSelectorTransformer = (scopingAttribute: any) => {
  return selectorParser((selectors) => {
    selectors.each((selector) => {
      let node: any = null;

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
        // @ts-ignore
        selectorParser.attribute({
          attribute: scopingAttribute
        })
      );
    });
  });
};

const generateScopedSelector = (selector: any, attribute: any) =>
  cssSelectorTransformer(attribute).processSync(selector);

const selectorPrefixer = (hash: string) => (element: any) => {
  // rule is the AST node which has the css selector
  if (element.type === 'rule') {
    // map over each existing select and prefix it
    const newSelectors = element.props.map((selector: any) => {
      return generateScopedSelector(
        selector,
        `${ABELL_CSS_DATA_PREFIX}-${hash}`
      );
    });
    // Mutate the old ast node with the new selectors
    element.props = newSelectors;
  }
};

/**
 * Pass CSS string and hash as a param and get scoped css in output
 */
export const getScopedCSS = (cssString: string, hash: string): string => {
  return stylis.serialize(
    stylis.compile(cssString),
    stylis.middleware([selectorPrefixer(hash), stylis.stringify])
  );
};
