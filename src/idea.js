function buildHTMLPage(filename, {metaInfos, abellConfigs}) {

  const pageTemplate = fs.readFileSync(path.join(abellConfigs.sourcePath, filename), 'utf-8');

  const pageContent = Mustache.render(
    pageTemplate, 
    {
      $contentList: Object.values(metaInfos),
      globalMeta: abellConfigs.meta
    }
  )

  fs.writeFileSync(path.join(abellConfigs.destinationPath, filename), pageContent);
  
  return true;
}


function build() {
  // action.build


}