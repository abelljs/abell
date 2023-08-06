export const noConfigSetup = {
  files: {
    'index.abell': {
      file: {
        contents: `
        {{
          // declarations
          const a = 'Hello, ';
          const b = 'World 🌻';
        }}

        <body>{{ a + b.toUpperCase() }}</body>
        `
      }
    },
    'package.json': {
      file: {
        contents: JSON.stringify(
          {
            name: 'vite-abell',
            type: 'module',
            scripts: {
              start: 'abell dev',
              build: 'abell generate'
            },
            dependencies: {
              abell: '1.0.0-alpha.83'
            }
          },
          null,
          4
        )
      }
    }
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

export const loopsAndConditions = {
  files: {
    'index.abell': {
      file: {
        contents: `
        {{
          // declarations
          const fruits = ['apple', 'banana', 'orange'];
        }}
        <body>
          <ul>
          {{
            fruits.map((fruit) => {
              if (fruit === 'orange') {
                return null;
              }
              return /* html */\`<li>\${fruit}</li>\`
            })
          }}
          </ul>
        </body>
        `
      }
    },
    'package.json': {
      file: {
        contents: JSON.stringify(
          {
            name: 'vite-abell',
            type: 'module',
            scripts: {
              start: 'abell dev',
              build: 'abell generate'
            },
            dependencies: {
              abell: '1.0.0-alpha.83'
            }
          },
          null,
          4
        )
      }
    }
  },
  minHeight: '500px',
  showURLBar: false,
  showFileExplorer: false,
  activeFile: 'index.abell',
  output: {
    '/': {
      screen: 'Hello, WORLD 🌻'
    }
  }
};

export const immediatelyInvokedFunctions = {
  files: {
    'index.abell': {
      file: {
        contents: `
        {{
          // declarations
          const fruits = ['apple', 'banana', 'orange'];
        }}
        <body>
          {{
            // defined functions are automatically invoked by abell
            () => {
              if (fruits.includes('apple')) {
                return /* html */\`Array contains <b>apple</b>!! 🍎\`;
              }
              return 'Array does not contain apple';
            }
          }}
        </body>
        `
      }
    },
    'package.json': {
      file: {
        contents: JSON.stringify(
          {
            name: 'vite-abell',
            type: 'module',
            scripts: {
              start: 'abell dev --port 5000',
              build: 'abell generate'
            },
            dependencies: {
              abell: '1.0.0-alpha.83'
            }
          },
          null,
          4
        )
      }
    }
  },
  minHeight: '500px',
  showURLBar: false,
  showFileExplorer: false,
  activeFile: 'index.abell',
  output: {
    '/': {
      screen: 'Hello, WORLD 🌻'
    }
  }
};
