/**
 * Executes before starting build
 *
 * @param {Object} programInfo
 * @param {Object} options
 * @param {Function} options.createContent
 */
function beforeBuild(programInfo, { createContent }) {
  const nodes = [
    {
      slug: 'hello-custom-blog',
      content: `# Hello`,
      createdAt: new Date('13 May 2019'),
      modifiedAt: new Date('13 May 2019')
    },
    {
      slug: 'blog-from-plugin',
      content: `
        <h1>Blog from Plugin</h1>
        <p>Description of plugin</p>
      `,
      contentType: 'html',
      createdAt: new Date('1 May 2020'),
      modifiedAt: new Date('1 May 2020')
    }
  ];

  for (const node of nodes) {
    createContent(node);
  }
}

/**
 * Executes before HTML string is written into .html file.
 * @param {string} htmlTemplate HTML String before writing into .html
 * @param {ProgramInfo} programInfo
 * @return {string}
 */
function beforeHTMLWrite(htmlTemplate, programInfo) {
  const cssToAdd = `
  <style>
    body {
      background-color: green;
    }
  </style>
  `;

  const headEndIndex = htmlTemplate.indexOf('</head>');
  if (headEndIndex < 0) {
    // if the text does not have </head>
    return '<head>' + cssToAdd + '</head>' + htmlTemplate;
  }

  const newHTMLTemplate =
    htmlTemplate.slice(0, headEndIndex) +
    cssToAdd +
    htmlTemplate.slice(headEndIndex);

  return newHTMLTemplate;
}

/**
 * Runs after build of abell
 */
function afterBuild() {
  console.log('After build working!');
}

module.exports = { beforeBuild, beforeHTMLWrite, afterBuild };
