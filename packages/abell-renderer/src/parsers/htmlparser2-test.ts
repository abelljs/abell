import vm from 'vm';

import { Parser } from 'htmlparser2';
import abellParser from './abell-parser';

/**
 * <Navbar>
 * </Navbar>
 *
 *
 */

let finalCode = '';
const sandbox = { hello: 'yay' };
const context: vm.Context = vm.createContext(sandbox); // eslint-disable-line

const parser = new Parser(
  {
    onopentag(tagName, attributes) {
      /*
       * This fires when a new tag is opened.
       *
       * If you don't need an aggregated `attributes` object,
       * have a look at the `onopentagname` and `onattribute` events.
       */
      // console.log(tagName, attributes);
      // if ('props' in attributes) {
      //   const abellPropsParsed = Object.entries(attributes)
      //     .flatMap((val) => val)
      //     .join('')
      //     .replace('props', '');
      //   console.log(abellPropsParsed);
      // }
      finalCode += `<${tagName}>`;
    },

    ontext(textString) {
      // const cleanJSCode = textString.replace(/{{|}}/g, '');
      // if (cleanJSCode) {
      //   const jsOutput = abellParser.runJS(cleanJSCode, context, 0, {});
      //   finalCode += jsOutput;
      // }
      finalCode += textString;
      console.log(textString);
      console.log('----------------');
    },

    onattribute(attrName, attrValue, quotes) {
      // console.log(attrName, attrValue, quotes);
    },

    onclosetag(tagName) {
      /*
       * Fires when a tag is closed.
       *
       * You can rely on this event only firing when you have received an
       * equivalent opening tag before. Closing tags without corresponding
       * opening tags will be ignored.
       */
      finalCode += `</${tagName}>`;
    }
  },
  {
    lowerCaseTags: false
  }
);

export const getOutputCode = (): string => finalCode;

export default parser;
