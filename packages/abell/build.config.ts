import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['./src/index', './src/bin'],
  declaration: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      include: /.[tj]s$/
    }
  }
});
