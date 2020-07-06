const fetch = require('node-fetch');
const fs = require('fs');

async function beforeBuild(programInfo){
  const res = await (await fetch('https://dev.to/api/articles?username=saurabhdaware')).json();
  const sortedArticles = res
    .sort((a,b) => a.positive_reactions_count > b.positive_reactions_count?-1:1)
    .slice(0,3)
    .map(({url, title, tag_list, positive_reactions_count, comments_count}) =>
      ({url, title, tag_list, positive_reactions_count, comments_count})
    )
  
  fs.writeFileSync(
    `${programInfo.abellConfigs.sourcePath}/data/articles.json`, 
    JSON.stringify(sortedArticles, undefined, 2)
  )

  return sortedArticles;
}

module.exports = {beforeBuild}