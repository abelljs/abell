/* eslint-disable max-len */
import { EXAMPLES_ABELL_VERSION } from '../config';

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
              abell: EXAMPLES_ABELL_VERSION
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
              abell: EXAMPLES_ABELL_VERSION
            }
          },
          null,
          4
        )
      }
    }
  },
  minHeight: '570px',
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
              abell: EXAMPLES_ABELL_VERSION
            }
          },
          null,
          4
        )
      }
    }
  },
  minHeight: '550px',
  showURLBar: false,
  showFileExplorer: false,
  activeFile: 'index.abell',
  output: {
    '/': {
      screen: 'Hello, WORLD 🌻'
    }
  }
};

export const componentsUsage = {
  files: {
    'global.css': {
      file: {
        contents: `
        html, body {
          margin: 0px;
          font-family: Helvetica;
        }

        main {
          padding: 4px 8px;
        }
        `
      }
    },
    '_navbar.abell': {
      file: {
        contents: `
          {{
            // declarations
            const links = [
              {
                title: 'Home',
                href: '/',
              },
              {
                title: 'About',
                href: '/about'
              }
            ]
          }}
          <nav>
            <ul>
              {{
                links.map((link) => /* html */\`
                  <li>
                    <a 
                      href="\${link.href}" 
                      class="\${link.href === props.href ? 'active' : ''}"
                    >
                      \${link.title}
                    </a>
                  </li>
                \`)
              }}
            </ul>
          </nav>

          <!-- 
            styles are scoped for component by default.
            You can use scoped="false" attribute to make styles global 
          -->
          <style>
          nav {
            background-color: #eee;
            color: #222;
            padding: 4px 8px;
          }

          ul {
            list-style: none;
            display: flex;
            gap: 12px;
            padding: 0px;
            margin: 0px;
          }

          a {
            text-decoration: none;
            color: #000;
          }

          a.active {
            color: #2E3ECC;
            font-weight: bold;
          }
          </style>  
        `
      }
    },
    'index.abell': {
      file: {
        contents: `
        {{
          import navbar from './_navbar.abell';
        }}
        <html>
        <head>
          <link rel="stylesheet" href="./global.css" />
        </head>
        <body>
          {{ navbar({ href: '/' }) }}
          <main>
            <h2>Index Page</h2>
            <p>This is coming from index.abell file</p>
          </main>
        </body>
        </html>
        `
      }
    },
    'about.abell': {
      file: {
        contents: `
        {{
          import navbar from './_navbar.abell';
        }}
        <html>
        <head>
          <link rel="stylesheet" href="./global.css" />
        </head>
        <body>
          {{ navbar({ href: '/about' }) }}
          <main>
            <h2>About Page</h2>
            <p>This is coming from about.abell file</p>
          </main>
        </body>
        </html>
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
              start: 'abell dev --port 8000',
              build: 'abell generate'
            },
            dependencies: {
              abell: EXAMPLES_ABELL_VERSION
            }
          },
          null,
          4
        )
      }
    }
  },
  minHeight: '550px',
  showURLBar: true,
  showFileExplorer: true,
  activeFile: 'index.abell',
  output: {
    '/': {
      screen: 'Hello, WORLD 🌻'
    }
  }
};

export const allVite = {
  files: {
    'Docs.mdx': {
      file: {
        contents: `
          # Hello from MDX!!

          With Abell, you can use the existing Vite plugins!! 
          There is nothing called \`abell.config.ts\`, it's just vite.config.ts 🥳
        `
      }
    },
    'index.abell': {
      file: {
        contents: `
        {{
          import Docs from './Docs.mdx';
        }}
        <html>
        <body>
          {{ Docs }}
        </body>
        </html>
        `
      }
    },
    'vite.config.ts': {
      file: {
        contents: `
        import { defineConfig } from 'abell';
        import mdx from '@mdx-js/rollup';
        import { vitePluginJSXToHTML } from 'vite-plugin-jsx-to-html';

        export default defineConfig({
          plugins: [
            mdx(), // Turns MDX to React Component (JSX)
            vitePluginJSXToHTML({ extensions: ['.mdx'] }), // Turns JSX to HTML
          ],
        });
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
              start: 'abell dev --port 8000',
              build: 'abell generate'
            },
            dependencies: {
              abell: EXAMPLES_ABELL_VERSION,
              'vite-plugin-jsx-to-html': '^0.0.2',
              '@mdx-js/rollup': '^2.3.0'
            }
          },
          null,
          4
        )
      }
    }
  },
  activeFile: 'vite.config.ts',
  minHeight: '550px',
  output: {
    '/': {
      screen:
        "<h1>Hello from MDX!!</h1><p>With Abell, you can use the existing Vite plugins!! There is nothing called `abell.config.ts`, it's just vite.config.ts 🥳</p>"
    }
  }
};
