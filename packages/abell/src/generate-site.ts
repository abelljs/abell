import fs from 'fs';
import path from 'path';
import { ProgramInfo } from './utils/build-utils';
import {
  createPathIfAbsent,
  recursiveFindFiles,
  rmdirRecursiveSync,
  standardizePath
} from './utils/abell-fs';
import abellRenderer from 'abell-renderer';
import createBundles, { commitVirtualFileSystem } from './utils/abell-bundler';

function generateSite(programInfo: ProgramInfo): void {
  rmdirRecursiveSync(programInfo.abellConfig.outputPath);
  fs.mkdirSync(programInfo.abellConfig.outputPath);
  // TODO: clear bundle cache here
  const abellFiles = recursiveFindFiles(
    programInfo.abellConfig.sourcePath,
    '.abell'
  );

  for (const abellFile of abellFiles) {
    const abellTemplate = fs.readFileSync(abellFile, 'utf8');
    if (abellTemplate.startsWith('<AbellComponent')) {
      continue;
    }

    const rootPath = path.relative(
      path.dirname(abellFile),
      programInfo.abellConfig.sourcePath
    );
    const relativeOutputPath = path
      .relative(programInfo.abellConfig.sourcePath, abellFile)
      .replace('.abell', '.html');

    const abell = {
      globalMeta: programInfo.abellConfig.globalMeta,
      programInfo: {
        sourcePath: programInfo.abellConfig.sourcePath,
        outputPath: programInfo.abellConfig.outputPath,
        task: programInfo.task
      },
      root: standardizePath(rootPath),
      href: relativeOutputPath.replace(/index\.html/g, '')
    };

    const { html, components } = abellRenderer.render(
      abellTemplate,
      { abell },
      {
        dangerouslyAllowRequire: true,
        allowComponents: true,
        filename: path.relative(programInfo.baseWorkingDir, abellFile),
        basePath: path.dirname(abellFile)
      }
    );

    const outputPath = path.join(
      programInfo.abellConfig.outputPath,
      relativeOutputPath
    );

    const htmlWithInlinedCode = createBundles({
      components,
      html,
      outputPath
    });

    createPathIfAbsent(path.dirname(outputPath));

    fs.writeFileSync(outputPath, htmlWithInlinedCode);
  }

  commitVirtualFileSystem();
}

export default generateSite;
