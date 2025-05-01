import fs from 'fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJSON = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
) as { version: string };

// Create an MCP server
const server = new McpServer({
  name: 'Abell AI: MCP',
  version: packageJSON.version
});

// Add an addition tool
server.tool(
  'get_abell_syntax',
  'This is to help understand the syntax of Abell and get basic understanding of abell',
  {},
  async () => {
    try {
      const syntaxGuide = await fetch('https://abelljs.org/llms.txt').then(
        (res) => res.text()
      );
      return {
        content: [{ type: 'text', text: syntaxGuide }]
      };
    } catch (err: unknown) {
      console.log(err);
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: String(err)
          }
        ]
      };
    }
  }
);

server.tool(
  'scaffold_new_abell_app',
  "This scaffolds a new full fledge abell application. Note: Before calling tool, ensure you're in user's current working directory, ensure the directory is empty. Confirm the directory of scaffolding from user before running the tool",
  {
    projectName: z
      .string()
      .describe(
        "Name of the project. Directory is created based on this name. It should be '.' when user is expecting the project to be created in current directory. Should not have spaces. Should be lower-cased value"
      ),
    cwd: z
      .string()
      .describe(
        'Current working directory of user. Ensure project is created in current directory and not root directory or somewhere outside'
      ),
    installer: z.enum(['skip', 'npm', 'pnpm', 'yarn', 'bun'])
  },
  async ({ projectName = '.', cwd, installer = 'skip' }) => {
    const projectSlugName = projectName.toLowerCase().replace(/ |_/g, '-');
    const projectPath = path.join(cwd, projectSlugName);

    if (fs.existsSync(projectPath)) {
      if (fs.readdirSync(projectPath).length !== 0) {
        // Not an empty directory so break!
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'The directory already exists and is not an empty directory. Verify the cwd and projectName are as expected'
            }
          ]
        };
      }
    }

    execSync(
      `npx -y create-abell@latest ${projectName} --installer ${installer} --template default`,
      { stdio: 'inherit', cwd }
    );

    return {
      content: [
        {
          type: 'text',
          text: `Scaffolded ${projectName}. Install dependencies if not already installed and Run "dev" script from package.json file`
        }
      ]
    };
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();

export const connectMCPServer = async () => {
  try {
    await server.connect(transport);
    console.log('[abell-ai]: MCP Server Connected');
  } catch (err) {
    console.error('[abell-ai]: Could not connect MCP server', err);
  }
};
