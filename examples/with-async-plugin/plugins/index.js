/**
 * example wait function to pause excution
 * @param {number} time time to wait for
 */
async function wait(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const beforeBuild = async (programInfo) => {
  console.log(programInfo);
  console.log('Expected to wait here for 2seconds');
  await wait(2000);
  console.log('Still build did not happen');
};

module.exports = { beforeBuild };
