import React from 'react';
import ReactDOMServer from 'react-dom/server';

function renderJSXComponent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  JSXComponent: React.FC | ((...args: any) => JSX.Element) | null,
  props: Record<string, unknown>
): string {
  if (!JSXComponent) {
    return '';
  }
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(JSXComponent, props, null)
  );
}

export default renderJSXComponent;
