import { Parser } from 'htmlparser2';

const parser = new Parser(
  {
    onopentag(tagName, attributes) {
      /*
       * This fires when a new tag is opened.
       *
       * If you don't need an aggregated `attributes` object,
       * have a look at the `onopentagname` and `onattribute` events.
       */
      console.log(tagName, attributes);
    },

    onclosetag(tagName) {
      /*
       * Fires when a tag is closed.
       *
       * You can rely on this event only firing when you have received an
       * equivalent opening tag before. Closing tags without corresponding
       * opening tags will be ignored.
       */
      console.log(tagName);
    }
  },
  {
    lowerCaseTags: false
  }
);

export default parser;
