import { default as _path } from 'path';
import { evaluateAbellBlock as e } from 'abell';

    import x from './x';
  
const __filename = "/test.abell";
const __dirname = _path.dirname(__filename);
const root = _path.relative(__dirname, "/")
export const html = (props = {}) => {
  const Abell = { props, __filename, __dirname };
  
    /** @declarations */
    const x = 999;
  
  return `
  

  <b>${e( 3 + 4 )}</b>
  
  <nav>${e( x * 2 )}</nav>
  `
};
export default html;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9yaWdpbmFsLmFiZWxsIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0tBQ0s7O0tBRUE7Ozs7OztPQUdBOzs7T0FHQSIsImZpbGUiOiJnZW5lcmF0ZWQudHMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3NhdXJhYmhkYXdhcmUvRGVza3RvcC9wcm9qZWN0cy9hYmVsbC1vcmcvYWJlbGwtbW9ub3JlcG8vcGFja2FnZXMvYWJlbGwvc3JjL3V0aWxzL19fdGVzdHNfXy90ZXN0LWZpbGVzIiwic291cmNlc0NvbnRlbnQiOlsiXG4gICAge3tcbiAgICAgIGltcG9ydCB4IGZyb20gJy4veCc7XG4gICAgfX1cblxuICAgIDxiPnt7IDMgKyA0IH19PC9iPlxuICAgIHt7XG4gICAgICAvKiogQGRlY2xhcmF0aW9ucyAqL1xuICAgICAgY29uc3QgeCA9IDk5OTtcbiAgICB9fVxuICAgIDxuYXY+e3sgeCAqIDIgfX08L25hdj5cbiAgICAiXX0=