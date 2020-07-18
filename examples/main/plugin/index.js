function beforeBuild(programInfo, { createContent }) {
  const sourceNode = {
    slug: 'hello-custom-blog',
    markdownContent: '# Hello',
    createdAt: new Date('13 May 2019'),
    modifiedAt: new Date('13 May 2019')
  }

  createContent(sourceNode)
}

module.exports = { beforeBuild };
