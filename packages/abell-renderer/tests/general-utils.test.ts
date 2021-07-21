import { prefixHtmlTags } from '../src/utils/general-utils';

describe('prefixHTMLTags()', () => {
  it('should prefix a single html tag', () => {
    // eslint-disable-next-line max-len
    const testHTML = `<div class="something" id="something" aria-label=testitem>My Item</div>`;

    expect(prefixHtmlTags(testHTML, 'testhash')).toBe(
      // eslint-disable-next-line max-len
      `<div class="something" id="something" aria-label=testitem data-abell-testhash>My Item</div>`
    );
  });

  it('should prefix an auto closing tag', () => {
    const testHtml = `<br class="something" />`;
    expect(prefixHtmlTags(testHtml, 'testhash')).toBe(
      '<br class="something" data-abell-testhash />'
    );
  });

  it('should not prefix a closing tag', () => {
    const testHtml = `</div>`;
    expect(prefixHtmlTags(testHtml, 'testhash')).toBe(testHtml);
  });

  it('should not prefix Doctype', () => {
    const testHtml = `<!DOCTYPE html>`;
    expect(prefixHtmlTags(testHtml, 'testhash')).toBe(testHtml);
  });

  it('should prefix deeply nested tree', () => {
    const testHtml = `
      <div>
        <ul>
          <li><a href="test">test</a><a href="test">test</a></li>
          <li><a href="test">test</a><a href="test">test</a></li>
          <li><a href="test">test</a><a href="test">test</a></li>
          <li><a href="test">test</a><a href="test">test</a></li>
          <li><a href="test">test</a><a href="test">test</a></li>
        </ul>
        <div>
          <h1>test</h1>
          <div>
            <ol>
              <ul>
                <li>testing</li>
                <li>testing</li>
                <li>testing</li>
              </ul>
            </ol>
          </div>
        </div>
      </div>
    `;
    expect(prefixHtmlTags(testHtml, 'testhash')).toMatchSnapshot();
  });

  it('should prefix html with attributes having numbers in it', () => {
    const testHtml = `<div tabindex=0>test</div>`;
    expect(prefixHtmlTags(testHtml, 'testhash')).toBe(
      `<div tabindex=0 data-abell-testhash>test</div>`
    );
  });
});
