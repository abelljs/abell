/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

require('esbuild')
  .build({
    entryPoints: ['src/example/index.ts'],
    bundle: true,
    platform: 'node',
    watch: {
      onRebuild(error, result) {
        if (error) console.error('watch build failed:', error);
        else {
          fs.copyFileSync('src/example/index.abell', 'dev/example/index.abell');
          console.log(result);
        }
      }
    },
    outfile: 'dev/example/index.js'
  })
  .then((result) => {
    result.stop();
  });
