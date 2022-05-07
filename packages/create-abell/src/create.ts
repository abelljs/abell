import {
  getInstallCommand,
  getProjectInfo,
  getTemplate,
  scaffoldTemplate,
  setNameInPackageJSON
} from './steps';
import { deleteDir, log, relative, run } from './utils';

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
  const relProjectPath = relative(projectPath);
  const template = getTemplate(options.template);
  const installCommand = await getInstallCommand(options.installer);
  log.info(`Scaffolding \`${relProjectPath}\` using  \`${template}\` template`);

  // 2. Scaffold Project
  await scaffoldTemplate({
    projectPath,
    template
  });

  log.info(`Running \`${installCommand}\``);
  // 3. Install Dependencies
  try {
    await run(installCommand, {
      cwd: projectPath
    });
  } catch (err) {
    log.failure(`Could not install dependencies. Skipping ${installCommand}`);
  }

  // 4. Set name in project's package.json
  setNameInPackageJSON(`${projectPath}/package.json`, projectDisplayName);

  // 5. Delete `.git` (For projects scaffolded from github)
  deleteDir(`${projectPath}/.git`);

  // 6. Log Success @todo
  log.success(`${projectDisplayName} scaffolded successfully`);
  const runCommand = installCommand === 'yarn' ? 'yarn dev' : 'npm run dev';
  log.info(
    `cd ${relProjectPath} and run \`${runCommand}\` to run the dev-server`
  );
}

export default create;
