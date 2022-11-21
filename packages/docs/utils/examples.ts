export const noConfigSetup = {
  files: {
    'index.abell': `
        {{
          // declarations
          const a = 'Hello, ';
          const b = 'World 🌻';
        }}

        <body>{{ a + b.toUpperCase() }}</body>
        `,
    'package.json': `
        {
          "scripts": {
            "dev": "abell dev",
            "generate": "abell generate"
          },
          "devDependencies": {
            "abell": "^1.0.0"
          }
        }
        `
  },
  minHeight: '400px',
  showURLBar: false,
  activeFile: 'index.abell',
  output: {
    '/': {
      screen: 'Hello, WORLD 🌻'
    }
  }
};
