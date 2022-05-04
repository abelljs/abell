import {
  getInstallCommand,
  getProjectInfo,
  getTemplate,
  scaffoldTemplate,
  setNameInPackageJSON
} from './steps';
import { deleteDir, run } from './utils';

export type CreateAbellOptions = {
  installer?: 'npm' | 'yarn';
  template?: string;
};

async function create(
  projectNameArg: string | undefined,
  options: CreateAbellOptions
): Promise<void> {
  // 1. Get all the required project information
  const { projectDisplayName, projectPath } = await getProjectInfo(
    projectNameArg
  );
  const template = getTemplate(options.template);
  const installCommand = await getInstallCommand(options.installer);

  // 2. Scaffold Project
  await scaffoldTemplate({
    projectPath,
    template
  });

  // 3. Install Dependencies
  await run(installCommand, {
    cwd: projectPath
  });

  // 4. Set name in project's package.json
  setNameInPackageJSON(`${projectPath}/package.json`, projectDisplayName);

  // 5. Delete `.git`
  deleteDir(`${projectPath}/.git`);

  // 6. Log Success @todo
  console.log('yay');
}

export default create;
