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
  ]

  for (const node of nodes) {
    createContent(node)
  }
}

function afterBuild() {
  console.log('After build working!');
}

module.exports = { beforeBuild, afterBuild };
