import { getProgramInfo } from '../utils/build-utils';

type BuildOptions = {
  baseWorkingDir: string;
};
const defaultBuildOptions: BuildOptions = {
  baseWorkingDir: process.cwd()
};
function build(userOption: BuildOptions = defaultBuildOptions): void {
  console.log('Abell Build');
  const programInfo = getProgramInfo(userOption.baseWorkingDir);
  console.log(programInfo);
}

export default build;
