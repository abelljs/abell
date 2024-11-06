/**
 * Evaluates the abell block.
 *
 * Internally used to clean the output and return correct value.
 *
 */
export const evaluateAbellBlock = (val: unknown): string | boolean | number => {
  if (val === undefined || val === null) return ''; // never print undefined or null
  if (typeof val === 'function') return evaluateAbellBlock(val()); // if function, execute the function
  if (Array.isArray(val)) return val.join(''); // if array, join the array with ''
  if (typeof val === 'object') return JSON.stringify(val); // if object, stringify object
  if (
    typeof val === 'string' ||
    typeof val === 'boolean' || // string, boolean, number can take care of stringifying at the end
    typeof val === 'number'
  ) {
    return val;
  }

  // force stringification on rest
  return String(val);
};
