/* eslint-disable max-len */
import fs from 'fs';
import path from 'path';
import { parseComponent } from '../src/parsers/abell-component-parser';

describe('parseComponent()', () => {
  it('should have component name, other props, and respective content', () => {
    const basePath = path.join(__dirname, 'examples', 'example1');
    const filePath = path.join(basePath, 'TestComponent.abell');
    const exampleContent = fs.readFileSync(filePath, 'utf-8');

    const { html, components } = parseComponent(
      exampleContent,
      {},
      {
        filename: filePath,
        allowRequire: true,
        allowComponents: true,
        basePath: basePath
      }
    );
    expect(html.trim()).toBe(`<div data-abell-jTTqvd>6</div>`);
    expect(components[0]?.component).toBe('Hello.abell');
    expect(components[0]?.filepath).toBe('tests/examples/example1/Hello.abell');
    expect(components[0]?.scripts[0].content.trim()).toBe(
      `document.querySelector('div' + \"[data-abell-jTTqvd]\").innerHTML += 'hello';`
    );
    expect(components[0]?.styles[0].content.trim()).toBe(
      'div[data-abell-jTTqvd]{color:red;}'
    );
  });
});
