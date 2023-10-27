import {
  getInstallCommand,
  getProjectInfo,
  getTemplate,
  scaffoldTemplate,
  setPackageJSONValues
} from './steps';
import {
  colors,
  deleteDir,
  log,
  packageManagerRunMap,
  relative,
  run
} from './utils';

export type CreateAbellOptions = {
  installer?: 'npm' | 'yarn' | 'pnpm' | 'bun';
  template?: string;
};

async function create(
  projectNameArg: string | undefined,
  options: CreateAbellOptions
): Promise<void> {
  // 1. Get all the required project information
  const { projectDisplayName, projectPath } =
    await getProjectInfo(projectNameArg);
  const relProjectPath = relative(projectPath);
  const template = getTemplate(options.template);
  const installCommand = await getInstallCommand(options.installer);

  // 2. Scaffold Project
  console.log('');
  log.info(
    `Scaffolding ${colors.bold(relProjectPath)} using  ${colors.bold(
      template
    )} template`,
    1
  );

  await scaffoldTemplate({
    projectPath,
    template
  });

  let runCommand: string | undefined;

  console.log('');

  if (installCommand) {
    // 3. Install Dependencies
    log.info(`Running ${colors.bold(installCommand)}`, 2);
    try {
      await run(installCommand, {
        cwd: projectPath
      });
    } catch (err) {
      log.failure(`Could not install dependencies. Skipping ${installCommand}`);
    }

    runCommand = packageManagerRunMap[installCommand];
  }

  // 4. Set name in project's package.json
  setPackageJSONValues(`${projectPath}/package.json`, {
    name: projectDisplayName,
    scripts: {
      dev:
        installCommand === 'bun install' ? 'bunx --bun abell dev' : 'abell dev',
      generate:
        installCommand === 'bun install'
          ? 'bunx --bun abell generate'
          : 'abell generate'
    }
  });

  // 5. Delete `.git` (For projects scaffolded from github)
  deleteDir(`${projectPath}/.git`);

  // 6. Log Success
  log.success(`${projectDisplayName} scaffolded successfully 🚀\n`);

  if (runCommand) {
    log.info(
      `${colors.bold(`cd ${relProjectPath}`)} and run ${colors.bold(
        runCommand
      )} to run the dev-server\n`
    );
  }
}

export default create;
