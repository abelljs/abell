import path from 'path';
import fs from 'fs';
import { JSDOM } from 'jsdom';

import { render } from '../src/index';
import hash from '../src/utils/hash';
import { normalizePath } from '../src/utils/general-utils';

describe('scoped css', () => {
  // loading and rendering test component
  const fileData = fs
    .readFileSync(
      path.join(__dirname, 'examples', 'example-scoped', 'Main.abell')
    )
    .toString();
  const basePath = path.join(__dirname, 'examples', 'example-scoped');
  const renderedComponent = render(
    fileData,
    {},
    {
      allowRequire: true,
      allowComponents: true,
      basePath
    }
  );
  const { document } = new JSDOM(renderedComponent.html).window;

  it('should have a stable html snapshot', () => {
    expect(renderedComponent.html).toMatchSnapshot();
  });

  it('should have the scoped component', () => {
    const scopedPath = path.relative(
      process.cwd(),
      path.join(basePath, 'Scoped.abell')
    );
    // we normalize the path for windows so that hash is stable across OS
    const componentHash = hash(normalizePath(scopedPath));

    const scopedComponent = renderedComponent.components[0];
    expect(scopedComponent).toBeDefined();

    expect(
      document.querySelector(`div[data-abell-${componentHash}]`).innerHTML
    ).toBe(`This is a test component for testing scoped css.123`);

    expect(scopedComponent.styles).toHaveLength(1);

    const componentStyle = scopedComponent.styles[0];

    expect(componentStyle.content).toContain(
      `div[data-abell-${componentHash}]`
    );
    expect(scopedComponent.scripts).toHaveLength(0);
  });

  it('should have the global component', () => {
    const globalComponentPath = path.relative(
      process.cwd(),
      path.join(basePath, 'Global.abell')
    );
    // we normalize the path for windows
    const componentHash = hash(normalizePath(globalComponentPath));

    const globalComponent = renderedComponent.components[1];
    expect(globalComponent).toBeDefined();

    expect(
      document.querySelector(`div[data-abell-${componentHash}]`)
    ).toBeNull();

    expect(globalComponent.styles).toHaveLength(1);

    const componentStyle = globalComponent.styles[0];

    expect(componentStyle.content).not.toContain(
      `div[data-abell-${componentHash}]`
    );

    expect(componentStyle.attributes.global).toBe(true);
    expect(globalComponent.scripts).toHaveLength(0);
  });
});
