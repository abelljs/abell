function beforeBuild() {
  console.log('I run before build');
}

function afterBuild() {
  console.log('I run after build');
}

module.exports = {beforeBuild, afterBuild}