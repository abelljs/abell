import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import { copyFolderSync, log, normalizePath, run } from './utils';

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
    ).projectName;
  } else {
    projectName = projectNameArg;
  }

  if (!projectName) {
    log.failure('Project Name is required');
    process.exit(1);
  }

  const projectSlugName = projectName.toLowerCase().replace(/ |_/g, '-');
  const projectPath = path.join(process.cwd(), projectSlugName);
  const projectDisplayName = path.basename(projectPath);

  if (fs.existsSync(projectPath)) {
    if (fs.readdirSync(projectPath).length !== 0) {
      // Not an empty directory so break!
      log.failure('The directory already exists and is not an empty directory');
      process.exit(0);
    }
  }

  return { projectDisplayName, projectPath };
};

type InstallerTypes = 'npm' | 'yarn' | 'pnpm' | 'bun';

/**
 * Prompts user to choose package installer if not defined
 */
export const getInstallCommand = async (
  installerVal: InstallerTypes | 'skip' | undefined
): Promise<`${InstallerTypes} install` | undefined> => {
  if (!installerVal) {
    // if installer flag is undefined, ask user.
    const answers = await prompts({
      type: 'select',
      message: 'Select Installer',
      name: 'installer',
      choices: [
        {
          title: 'npm',
          value: 'npm'
        },
        {
          title: 'yarn',
          value: 'yarn'
        },
        {
          title: 'pnpm',
          value: 'pnpm'
        },
        {
          title: 'bun',
          value: 'bun'
        },
        {
          title: 'skip installation',
          value: 'skip'
        }
      ]
    });

    installerVal = answers.installer;
  }

  if (!installerVal || installerVal === 'skip') {
    return undefined;
  }

  return `${installerVal} install`;
};

/**
 * Some validations on top of template names
 */
export const getTemplate = (templateVal: string | undefined): string => {
  // return default when value is not defined
  if (!templateVal) return 'default';

  if (templateVal === 'default' || templateVal === 'bun-default') {
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
  if (template === 'default' || template === 'bun-default') {
    // copy default template from templates directory
    const templatesDir = path.join(__dirname, '..', 'templates');
    const templatePath = path.join(templatesDir, template);
    copyFolderSync(templatePath, projectPath, [
      path.join(templatePath, 'node_modules'),
      path.join(templatePath, 'yarn.lock'),
      path.join(templatePath, 'dist')
    ]);
  } else {
    // Execute git clone
    try {
      const errorCode = await run(`git clone ${template} ${projectPath}`);
      if (errorCode === 1) {
        throw new Error(
          log.failure(`git clone failed for template ${template}`, false)
        );
      }
    } catch (err) {
      throw err;
    }
  }
};

export const setPackageJSONValues = (
  packagePath: string,
  {
    name,
    scripts
  }: {
    name: string;
    scripts?: {
      dev?: string;
      generate?: string;
    };
  }
): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const packageJSON = require(normalizePath(packagePath));
    packageJSON.name = name;
    if (scripts?.dev && scripts.generate) {
      packageJSON.scripts.dev = scripts.dev;
      packageJSON.scripts.generate = scripts.generate;
    }
    fs.writeFileSync(packagePath, JSON.stringify(packageJSON, null, 2));
  } catch (err) {
    // Do nothing. Skip the step if error.
  }
};
