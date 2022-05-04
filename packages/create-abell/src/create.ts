import { getInstallCommand, getProjectInfo, getTemplate } from './steps';

export type CreateAbellOptions = {
  installer?: 'npm' | 'yarn';
  template?: string;
};

async function create(
  projectNameArg: string | undefined,
  options: CreateAbellOptions
): Promise<void> {
  // 1. Get all the required project information
  const { projectName, projectDisplayName, projectPath } = await getProjectInfo(
    projectNameArg
  );

  const template = getTemplate(options.template);
  const installCommand = await getInstallCommand(options.installer);

  // 2.

  console.log({
    projectName,
    projectPath,
    projectDisplayName,
    template,
    installCommand
  });
}

export default create;
