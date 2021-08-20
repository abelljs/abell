import { getProgramInfo } from '../utils/build-utils';
import generateSite from '../generate-site';

type BuildOptions = {
  baseWorkingDir: string;
};
const defaultBuildOptions: BuildOptions = {
  baseWorkingDir: process.cwd()
};
function build(userOption: BuildOptions = defaultBuildOptions): void {
  const programInfo = getProgramInfo(userOption.baseWorkingDir);
  programInfo.logs = 'full';
  programInfo.task = 'build';
  console.log('\n>> Abell Build Started\n');
  generateSite(programInfo);
  console.log('\n>> Abell Build Finished\n');
}

export default build;
