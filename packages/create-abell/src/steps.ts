import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import { colors, copyFolderSync, normalizePath, run } from './utils';

/**
 * Prompts user for projectName if not defined, returns the information required related to project
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getProjectInfo = async (projectNameArg: string | undefined) => {
  let projectName = '';
  if (!projectNameArg) {
    projectName = (
      await prompts({
        type: 'text',
        message: 'Enter Name of your project',
        name: 'projectName',
        initial: 'hello-abell'
      })
    ).projectName as string;
  }

  const projectSlugName = projectName.toLowerCase().replace(/ |_/g, '-');
  const projectPath = path.join(process.cwd(), projectSlugName);
  const projectDisplayName = path.basename(projectPath);

  if (fs.existsSync(projectPath)) {
    // oops. Can be an issue
    if (fs.readdirSync(projectPath).length !== 0) {
      // Not an empty directory so break!
      console.error(
        `${colors.red(
          '>> '
        )} The directory already exists and is not an empty directory`
      );
      process.exit(0);
    }
  }

  return { projectDisplayName, projectPath };
};

/**
 * Prompts user to choose package installer if not defined
 */
export const getInstallCommand = async (
  installerVal: 'npm' | 'yarn' | undefined
): Promise<'npm install' | 'yarn'> => {
  if (!installerVal) {
    // if installer flag is undefined, ask user.
    const answers = await prompts({
      type: 'select',
      message: 'Select Installer',
      name: 'installer',
      choices: [
        {
          title: 'npm',
          value: 'npm install'
        },
        {
          title: 'yarn',
          value: 'yarn'
        }
      ]
    });

    installerVal = answers.installer;
  }

  if (installerVal === 'yarn') {
    return 'yarn';
  } else {
    return 'npm install';
  }
};

/**
 * Some validations on top of template names
 */
export const getTemplate = (templateVal: string | undefined): string => {
  // return default when value is not defined
  if (!templateVal) return 'js';

  if (templateVal === 'js' || templateVal === 'ts') {
    // 'default' and 'minimal' are valid templates. Return them as it is
    return templateVal;
  }

  // when `--template abelljs/abell-starter-portfolio`
  if (!templateVal.startsWith('https://github.com/')) {
    // If template value is `abelljs/abell-starter-portfolio`, add https://github.com before it.
    return 'https://github.com/' + templateVal;
  }

  // when `--template https://github.com/abelljs/abell-starter-portfolio`
  return templateVal;
};

export const scaffoldTemplate = async ({
  projectPath,
  template
}: {
  projectPath: string;
  template: string;
}): Promise<void> => {
  console.log('scaffolding app');
  if (template === 'js' || template === 'ts') {
    // copy default template from templates directory
    const templatesDir = path.join(__dirname, '..', 'templates');
    copyFolderSync(path.join(templatesDir, template), projectPath, [
      path.join(templatesDir, template, 'node_modules')
    ]);
  } else {
    // Execute git clone
    console.log(`\n${colors.green('>')} Fetching Template from GitHub ✨\n\n`);

    try {
      const errorCode = await run(`git clone ${template} ${projectPath}`);
      if (errorCode === 1) {
        throw new Error('[create-abell]: Could not git clone project');
      }
    } catch (err) {
      throw err;
    }
  }
};

export const setNameInPackageJSON = (
  packagePath: string,
  appName: string
): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJSON = require(normalizePath(packagePath));
    packageJSON.name = appName;
    fs.writeFileSync(packagePath, JSON.stringify(packageJSON, null, 2));
  } catch (err) {
    // Do nothing. Skip the step if error.
  }
};
