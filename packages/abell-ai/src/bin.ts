#!/usr/bin/env node
import { connectMCPServer } from './mcp.js';

const args = process.argv.slice(2);

if (args[0] === 'mcp') {
  await connectMCPServer();
} else {
  console.error('[abell-ai]: Correct usage of the script `npx abell-ai mcp`');
  console.error('[abell-ai]: Received args:', process.argv);
}
