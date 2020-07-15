function beforeBuild(programInfo, { createContent }) {
  const sourceNode = {
    slug: 'hello-custom-blog',
    content: '# Hello',
    createdAt: new Date(),
    modifiedAt: new Date()
  }

  createContent(sourceNode)
}

module.exports = { beforeBuild };
