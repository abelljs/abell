export function addToHeadEnd(stringToAdd: string, htmlText: string): string {
  const headEndIndex = htmlText.indexOf('</head>');
  if (headEndIndex < 0) {
    // if the text does not have </head>
    return '<head>' + stringToAdd + '</head>' + htmlText;
  }

  const out =
    htmlText.slice(0, headEndIndex) +
    stringToAdd +
    htmlText.slice(headEndIndex);
  return out;
}

export function addToBodyEnd(stringToAdd: string, htmlText: string): string {
  const bodyEndIndex = htmlText.indexOf('</body>');
  if (bodyEndIndex < 0) {
    // if the text does not have </head>
    return htmlText + '<body>' + stringToAdd + '</body>';
  }

  return (
    htmlText.slice(0, bodyEndIndex) + stringToAdd + htmlText.slice(bodyEndIndex)
  );
}
