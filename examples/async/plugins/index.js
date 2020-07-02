const fetch = require('node-fetch');

const beforeBuild = async (programInfo) => {
  console.log(programInfo);
  await fetch('https://saurabhdaware.in').then(res => res.text());
  console.log('Still before build');
};

module.exports = { beforeBuild };
