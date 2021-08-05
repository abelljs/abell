import fs from 'fs';
import path from 'path';
import { getProgramInfo, ProgramInfo } from '../utils/build-utils';
import {
  createPathIfAbsent,
  recursiveFindFiles,
  rmdirRecursiveSync,
  standardizePath
} from '../utils/abell-fs';
import abellRenderer from 'abell-renderer/src'; // TODO: change to prod version

function generateSite(programInfo: ProgramInfo) {
  rmdirRecursiveSync(programInfo.abellConfig.outputPath);
  fs.mkdirSync(programInfo.abellConfig.outputPath);
  // TODO: clear bundle cache here
  const abellFiles = recursiveFindFiles(
    programInfo.abellConfig.sourcePath,
    '.abell'
  );

  for (const abellFile of abellFiles) {
    const rootPath = path.relative(
      path.dirname(abellFile),
      programInfo.abellConfig.sourcePath
    );
    const relativeOutputPath = path
      .relative(programInfo.abellConfig.sourcePath, abellFile)
      .replace('.abell', '.html');
    const Abell = {
      globalMeta: programInfo.abellConfig.globalMeta,
      programInfo: {
        sourcePath: programInfo.abellConfig.sourcePath,
        outputPath: programInfo.abellConfig.outputPath,
        task: programInfo.task
      },
      root: standardizePath(rootPath),
      href: relativeOutputPath.replace(/index\.html/g, '')
    };

    const abellTemplate = fs.readFileSync(abellFile, 'utf8');
    const html = abellRenderer.render(
      abellTemplate,
      { Abell },
      {
        allowRequire: true,
        filename: path.relative(programInfo.baseWorkingDir, abellFile),
        basePath: path.dirname(abellFile)
      }
    );

    const outputPath = path.join(
      programInfo.abellConfig.outputPath,
      relativeOutputPath
    );

    createPathIfAbsent(path.dirname(outputPath));

    fs.writeFileSync(outputPath, html);
  }
}

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
