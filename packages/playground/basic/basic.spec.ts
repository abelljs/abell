/* eslint-disable max-len */
import { describe, test, expect, beforeAll } from 'vitest';
import { run, getDocument } from '../test-utils/utils';

describe('basic', () => {
  beforeAll(async () => {
    await run(__dirname);
  });

  test('index.html', () => {
    const container = getDocument('index.html');
    expect(container.querySelector('nav')?.innerHTML).toMatchInlineSnapshot(`
      "
        <ul data-abell-cbpsbg=\\"\\">
          <li data-abell-cbpsbg=\\"\\"><a href=\\"/\\" data-abell-cbpsbg=\\"\\">Nav Home</a></li>
          <li data-abell-cbpsbg=\\"\\"><a href=\\"/about\\" data-abell-cbpsbg=\\"\\">Nav About</a></li>
        </ul>
      "
    `);

    expect(container.querySelector('footer')?.innerHTML).toMatchInlineSnapshot(`
      "
        <ul data-abell-behtbr=\\"\\">
          <li data-abell-behtbr=\\"\\"><a href=\\"/\\" data-abell-behtbr=\\"\\">Footer Home</a></li>
          <li data-abell-behtbr=\\"\\"><a href=\\"/about\\" data-abell-behtbr=\\"\\">Footer About</a></li>
        </ul>
      "
    `);

    expect(container.querySelector('ul.outer-ul')?.innerHTML)
      .toMatchInlineSnapshot(`
      "
          <li>Outer Li</li>
        "
    `);

    expect(container.querySelectorAll('style').length).toBe(3);
  });
});
