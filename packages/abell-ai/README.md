# Abell AI

Package that contains all official AI tools for Abell language.

## MCP

### Installation

In your MCP client (like cursor, claude desktop, etc), open MCP settings and add new entry like this.

```json
{
  "mcpServers": {
    "Abell MCP": {
      "command": "npx",
      "args": ["abell-ai@latest", "mcp"]
    }
  }
}
```

That's it. You can now ask your AI MCP Client to "Show me how to add loops in Abell" or "Add faq section to this abell file" and your MCP client will call appropriate tools from this :D
