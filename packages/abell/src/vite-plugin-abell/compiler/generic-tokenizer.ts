/**
 * Copied from https://gist.github.com/borgar/451393/7698c95178898c9466214867b46acb2ab2f56d68
 * Made by borgar (https://github.com/borgar)
 *
 * Saurabh made some tiny modifications to support TS, and add position and line information
 */

export type Token<T> = {
  text: string;
  type: keyof T | 'default';
  matches?: string[];
  line?: number;
  pos?: number;
  col?: number;
};

/*
 * Tiny tokenizer
 *
 * - Accepts a subject string and an object of regular expressions for parsing
 * - Returns an array of token objects
 *
 * tokenize('this is text.', { word:/\w+/, whitespace:/\s+/, punctuation:/[^\w\s]/ }, 'invalid');
 * result => [{ token="this", type="word" },{ token=" ", type="whitespace" }, Object { token="is", type="word" }, ... ]
 *
 */
function tokenize<T extends Record<string, RegExp>>(
  s: string,
  parsers: T,
  deftok: 'default'
): Token<T>[] {
  let m;
  let r;
  let t;
  let skippedCodeLength = 0;
  const fullCodeString = s;
  const tokens = [];
  while (s) {
    t = null;
    m = s.length;
    for (const key in parsers) {
      r = parsers[key].exec(s);
      // try to choose the best match if there are several
      // where "best" is the closest to the current starting point
      if (r && r.index < m) {
        const pos = skippedCodeLength + r.index;
        const codeTillHere = fullCodeString.slice(0, pos);
        t = {
          text: r[0],
          type: key,
          matches: r.slice(1),
          pos,
          line: codeTillHere.split('\n').length,
          col: codeTillHere.slice(codeTillHere.lastIndexOf('\n')).length
        };
        m = r.index;
      }
    }
    if (m) {
      // there is text between last token and currently
      // matched token - push that out as default or "unknown"
      tokens.push({
        text: s.substr(0, m),
        type: deftok || 'unknown'
      });
    }
    if (t) {
      // push current token onto sequence
      tokens.push(t);
    }
    const currentSkippedLength = m + (t ? t.text.length : 0);
    skippedCodeLength += currentSkippedLength;
    s = s.substr(currentSkippedLength);
  }
  return tokens;
}

export default tokenize;
