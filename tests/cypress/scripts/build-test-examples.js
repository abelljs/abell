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
  if (err) throw err;
  if (stderr) throw stderr;
  if (stdout.includes('Abell Build Failed')) {
    console.log(stdout);
    throw new Error("Build failed (More logs above)");
  }
  console.log(stdout);
})