/**
 * Parse string attributes to object
 */
export function parseAttributes(attributes: string): Record<string, string> {
  const attributeMatches = attributes.match(/(?:[^\s"']+|(["'])[^"]*\1)+/g);
  if (!attributeMatches) {
    return {};
  }

  return attributeMatches.reduce((prevObj, val) => {
    const firstEqual = val.indexOf('=');
    if (firstEqual < 0) {
      return {
        ...prevObj,
        [val]: true
      };
    }
    const key = val.slice(0, firstEqual);
    let value = val.slice(firstEqual + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    return {
      ...prevObj,
      [key]: value
    };
  }, {});
}

export const isDeclarationBlock = (
  blockCount: number,
  blockContent: string
): boolean => {
  if (blockCount < 2 && blockContent.includes('import ')) {
    return true;
  }
  return false;
};
