const { exec } = require("child_process");

const shell = `
  cd tests/cypress/examples 
  cd standard 
  node ../../../../bin/abell.js build 
  cd ../minimal 
  node ../../../../bin/abell.js build 
  cd .. 
`;

exec(shell, (err, stdout, stderr) => {
  console.log(stdout);
})