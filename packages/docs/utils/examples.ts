/* eslint-disable max-len */
import dedent from 'dedent';
import { EXAMPLES_ABELL_VERSION } from '../config';

export type EditorConfigObjType = {
  files: Record<string, { file: { contents: string } }>;
  activeFile?: string;
  repoName?: `saurabhdaware/${string}`;
  minHeight?: string;
  showFileExplorer?: boolean;
  output: Record<string, { screen: string }>;
};

export const noConfigSetup = {
  files: {
    'index.abell': {
      file: {
        contents: `
        {{
          /** @declarations */
          const a = 'Hello, ';
          const b = 'World 🌻';
        }}

        <html>
        <body>{{ a + b.toUpperCase() }}</body>
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
  repoName: 'saurabhdaware/abell-single-file-example',
  minHeight: '400px',
  showURLBar: false,
  activeFile: 'index.abell',
  output: {
    '/': {
      screen: 'Hello, WORLD 🌻'
    }
  }
};

export const importExample = {
  files: {
    'greet.js': {
      file: {
        contents: `
        export const message = 'Hiii Human ^_^';
        `
      }
    },
    'index.abell': {
      file: {
        contents: `
        {{
          import { message } from './greet';
        }}

        <html>
        <body>
          <h1>{{ message }}</h1>
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
  repoName: 'saurabhdaware/abell-single-file-example',
  minHeight: '400px',
  showURLBar: false,
  activeFile: 'index.abell',
  output: {
    '/': {
      screen: '<h1>Hiii Human ^_^</h1>'
    }
  }
};

export const loopsAndConditions = {
  files: {
    'index.abell': {
      file: {
        contents: `
        {{
          /** @declarations */
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
      screen: `
      <style>ul { list-style: unset !important; padding: revert !important; }</style>
      <ul>
        <li>apple</li>
        <li>banana</li>
      </ul>
      `
    }
  }
};

export const immediatelyInvokedFunctions = {
  files: {
    'index.abell': {
      file: {
        contents: `
        {{
          /** @declarations */
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
      screen: `Array contains <b>apple</b>!! 🍎`
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
            /** @declarations */
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
      screen: `
        <style abell-generated="">nav[data-abell-cbPsbg]{background-color:#eee;color:#222;padding:4px 8px;}ul[data-abell-cbPsbg]{list-style:none;display:flex;gap:12px;padding:0px;margin:0px;}a[data-abell-cbPsbg]{text-decoration:none;color:#000;}a.active[data-abell-cbPsbg]{color:#2E3ECC;font-weight:bold;}</style>
        <style>
        .temporary-preview {
          margin: 0px !important;
          font-family: Helvetica;
        }
    
        main {
          padding: 4px 8px;
        }

        main.index-page {
          display: block;
        }

        main.about-page {
          display: none;
        }

        a.home {
          color:#2E3ECC;
          font-weight:bold;
        }

        .page-container.show-about a.home {
          color: #000;
          font-weight: normal;
        }

        .page-container.show-about a.about {
          color:#2E3ECC;
          font-weight:bold;
        }

        .page-container.show-about main.about-page {
          display: block;
        }
        .page-container.show-about main.index-page {
          display: none;
        }
        </style>
        <div class="page-container">
          <nav data-abell-cbpsbg="">
            <ul data-abell-cbpsbg="">
              <li data-abell-cbpsbg="">
                <a href="javascript:void" onclick="document.querySelector('.page-container').classList.remove('show-about');" class="home" data-abell-cbpsbg="">
                  Home
                </a>
              </li>
      
              <li data-abell-cbpsbg="">
                <a href="javascript:void" class="about" onclick="document.querySelector('.page-container').classList.add('show-about');" data-abell-cbpsbg="">
                  About
                </a>
              </li>
            </ul>
          </nav>
          <main class="index-page">
            <h2>Index Page</h2>
            <p>This is coming from index.abell file</p>
          </main>
          <main class="about-page">
            <h2>About Page</h2>
            <p>This is coming from about.abell file</p>
          </main>
        </div>
      `
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
  repoName: 'saurabhdaware/abell-mdx-example',
  minHeight: '550px',
  output: {
    '/': {
      screen:
        "<h1>Hello from MDX!!</h1><p>With Abell, you can use the existing Vite plugins!! There is nothing called <code>abell.config.ts</code>, it's just vite.config.ts 🥳</p>"
    }
  }
};

export const routingExample = {
  files: {
    'index.abell': {
      file: {
        contents: `<body>Hello from Index Page!!</body>`
      }
    },
    'entry.build.ts': {
      file: {
        contents: `
          import { Route } from 'abell';
          import index from './index.abell';

          export const makeRoutes =  (): Route[] => {
            return [
              {
                path: '/',
                // abell components are functions that return HTML string
                render: () => index()
              },
              {
                path: '/about',
                render: () => {
                  return '<body>We can return <b>any HTML</b> string here</body>';
                }
              }
            ]
          }
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
  activeFile: 'entry.build.ts',
  repoName: 'saurabhdaware/abell-custom-routing-example',
  minHeight: '640px',
  showURLBar: true,
  output: {
    '/': {
      screen: 'Hello from Index Page!!'
    },
    '/about': {
      screen: 'We can return <b>any HTML</b> string here'
    }
  }
};

export const markdownIntegration = {
  files: {
    'index.abell': {
      file: {
        contents: `
        {{
          import content, { attributes } from './content.md';
        }}
        <html>
        <head>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/github.min.css" />
        </head>
        <body>
          <h1>{{ attributes.title }}</h1>
          <div>
            {{ content }}
          </div>
        </body>
        </html>
        `
      }
    },
    'content.md': {
      file: {
        contents: dedent`
        ---
        title: "Hi from Markdown!"
        ---

        You can use any **markdown** features here!
        
        ## Syntax Highlighting

        \`vite-plugin-md-to-html\` also allows build-time syntax highlighting using highlightjs.
        
        ~~~js
        const a = 3;
        const b = 9;

        console.log(a + b);
        ~~~
        `
      }
    },
    'vite.config.ts': {
      file: {
        contents: `
        import { defineConfig } from 'abell';
        import { vitePluginMdToHTML } from 'vite-plugin-md-to-html';

        export default defineConfig({
          plugins: [
            vitePluginMdToHTML({
              syntaxHighlighting: true
            })
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
              start: 'abell dev --port 3000',
              build: 'abell generate'
            },
            dependencies: {
              abell: EXAMPLES_ABELL_VERSION,
              'vite-plugin-md-to-html': '*'
            }
          },
          null,
          4
        )
      }
    }
  },
  activeFile: 'index.abell',
  minHeight: '520px',
  showURLBar: true,
  output: {
    '/': {
      screen: `
      <style>
      #unstyled code {
        padding: 0px;
      }
      #unstyled pre > code, #unstyled pre {
        line-height: unset;
        font-size: unset;
      }
      #unstyled pre > code {
        padding: 1rem !important;
        font-size: 13px;
      }

      #unstyled p {
        font-size: unset;
        line-height: unset;
      }
      </style>
      <div id="unstyled">
        <h1>Hi from Markdown!</h1>
        <div>
          <p>You can use any <strong>markdown</strong> features here!</p>
          <h2>Syntax Highlighting</h2>
          <p><code>vite-plugin-md-to-html</code> also allows build-time syntax highlighting using highlightjs.</p>
<pre><code class="hljs language-js"><span class="hljs-keyword">const</span> a = <span class="hljs-number">3</span>;
<span class="hljs-keyword">const</span> b = <span class="hljs-number">9</span>;

<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(a + b);
          </code></pre>
        </div>
      </div>
      `
    }
  }
};

export const blogRoutingExample = {
  files: {
    'entry.build.ts': {
      file: {
        contents: `
        import { Route } from 'abell';
        import index from './index.abell';
        import blogLayout from './blog-layout.abell';
        const mdFiles = import.meta.glob('./*.md', { eager: true }); // Glob imports by Vite

        // looping through Vite's Glob object to create a readable object array
        const blogs = Object.entries(mdFiles).map(
          ([mdPath, mdModule]) => {
            return {
              path: mdPath.replace('./', '/').replace('.md', ''),
              title: mdModule.attributes.title,
              html: mdModule.default,
            }
          }
        );

        // Creating routes 
        const blogRoutes: Route[] = blogs.map((blog) => {
          return {
            path: blog.path,
            render: () => blogLayout({ content: blog.html })
          }
        })

        export const makeRoutes: Route[] = () => {
          return [
            {
              path: '/',
              // Here we can pass our readable object to create blog listing
              render: () => index({ blogs })
            },
            ...blogRoutes
          ];
        };
        `
      }
    },
    'index.abell': {
      file: {
        contents: `
        <body>
          <h2>My Blogs!</h2>
          <ul>
          {{
            props.blogs.map((blog) => /* html */ \`
              <li><a href="\${blog.path}">\${blog.title}</a></li>
            \`)
          }}
          </ul>
        </body>
        `
      }
    },
    'blog-layout.abell': {
      file: {
        contents: `
        <body>
        {{ props.content }}
        </body>  
        `
      }
    },
    'hello-world.md': {
      file: {
        contents: dedent`
        ---
        title: "Hello, World!"
        ---
        # Hi from Abell Blog

        I can write **markdown** here!
        `
      }
    },
    'tunuk-tunuk-tun.md': {
      file: {
        contents: dedent`
        ---
        title: "Tunuk Tunuk Tun Ta da da"
        ---
        ## You've Been Tunuk Tunuk Tund!!

        <img alt="Tunuk Tunuk Tun Screenshot" width="150px" crossOrigin="anonymous" src="https://res.cloudinary.com/saurabhdaware/image/upload//c_thumb,w_200/v1693664138/dcfa3d51-c1a2-4236-86bf-e5c52a1c82ea_kxzk8k.png" />
        `
      }
    },
    'vite.config.ts': {
      file: {
        contents: `
        import { defineConfig } from 'abell';
        import { vitePluginMdToHTML } from 'vite-plugin-md-to-html';

        export default defineConfig({
          plugins: [
            vitePluginMdToHTML()
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
              start: 'abell dev --port 3000',
              build: 'abell generate'
            },
            dependencies: {
              abell: EXAMPLES_ABELL_VERSION,
              'vite-plugin-md-to-html': '*'
            }
          },
          null,
          4
        )
      }
    }
  },
  activeFile: 'entry.build.ts',
  minHeight: '640px',
  showURLBar: true,
  output: {
    '/': {
      screen: `
      <h2>My Blogs!</h2>
      <ul>
        <li><a href="javascript:void()" onclick="window.onURLChange('/hello-world')">Hello, World!</a></li>
        <li><a href="javascript:void()" onclick="window.onURLChange('/tunuk-tunuk-tun')">Tunuk Tunuk Tun Ta da da</a></li>
      </ul>
      `
    },
    '/hello-world': {
      screen: 'We can return <b>any HTML</b> string here'
    },
    '/tunuk-tunuk-tun': {
      screen: `
      <h2>You've Been Tunuk Tunuk Tund!!</h2>

      <img alt="Tunuk Tunuk Tun Screenshot" width="150px" crossOrigin="anonymous" src="https://res.cloudinary.com/saurabhdaware/image/upload//c_thumb,w_200/v1693664138/dcfa3d51-c1a2-4236-86bf-e5c52a1c82ea_kxzk8k.png" />
      `
    }
  }
};
