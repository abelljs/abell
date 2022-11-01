import React from 'react';
import ReactDOMServer from 'react-dom/server';

function renderJSXComponent(JSXComponent: React.FC): string {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(JSXComponent, {}, null)
  );
}

export default renderJSXComponent;
