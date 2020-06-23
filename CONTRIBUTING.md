# Contributing to Abell

## Local Setup

- Fork [abelljs/abell](https://github.com/abelljs/abell)
- `git clone https://github.com/:github-username/abell`
- `cd abell`
- `npm install` - to install dependencies
- `npm link` - This will add the current directory to global packages.
- `cd demo` - Directory `demo` has a demo abell project.
- `abell build` to build project or `abell serve` to start dev server.

## Creating Pull Request

- Create a branch with name of feature you are working on. (e.g. `feat-abell-config`, `fix-serve-fails`, etc)
- Make changes in your locally cloned fork
- Send Pull Request from your branch to `main` branch.

## Running Automated Tests

Automated tests help us know if the changed code breaks something in the existing projects.

These automated tests will automatically run on Pull Request but if you want to run them locally before making a PR, you can follow [Testing Guide](https://github.com/abelljs/abell/tree/main/tests/README.md) to run tests locally.

## Detailed Guide to Code

Abell is a static-site-generator so you can think of this as a script that

1. Takes data from markdown files, and JSON files
2. Applies that data into a layout
3. Renders a static HTML file.

Abell shares 2 repositories

- [abelljs/abell](https://github.com/abelljs/abell)
  Static site generator (reading markdown, adding predefined variables, etc.)
- [abelljs/abell-renderer](https://github.com/abelljs/abell-renderer)
  0 dependency template engine (renders `.abell` files and outputs `.html` file, executes and builds JavaScript written inside brackets)

### - [abelljs/abell-renderer](https://github.com/abelljs/abell-renderer)

In the code of [abelljs/abell](https://github.com/abelljs/abell), you will see code that looks like,

```js
const abellRenderer = require('abell-renderer');
const abellTemplate = `<body>{{ 3 + 3 }}</body>`;

const htmlTemplate = abellRenderer.render(abellTemplate, {});
// htmlTemplate carries value:
// <body>6</body>
```

Function `abellRenderer.render(abellTemplate, sandbox, options)` executes the JavaScript inside brackets, and renders and outputs HTML content.

Full documentation at: [https://github.com/abelljs/abell-renderer#-javascript-api](https://github.com/abelljs/abell-renderer#-javascript-api)

### - [abelljs/abell](https://github.com/abelljs/abell)

This repository contains the code for static-site-generation. As you can see above that abell-renderer allows us to pass sandbox (an environment/variables, functions, etc.).

In static-site-generation, we need some variables like a variable that gives us the list and details of blogs, a function that lets us import markdown content, a variable to give a path to current blog. Abell provides all these variables and loops over a layout (`[$path]/index.abell` file) to dynamically generate blogs from a single layout. (See [src/utils/build-utils.js](https://github.com/abelljs/abell/blob/main/src/utils/build-utils.js))

The entry point of the code is [src/cli.js](https://github.com/abelljs/abell/blob/main/src/cli.js) which on `abell build` calls [src/commands/build.js](https://github.com/abelljs/abell/blob/main/src/commands/build.js) and on `abell serve` calls [src/commands/serve.js](https://github.com/abelljs/abell/blob/main/src/commands/serve.js)

Additionally, if you're developing a website, you need a dev-server that reloads when you change the code. Abell's dev server is written from scratch to provide quick reloads. The code related to reloading dev server is at [src/abell-dev-server/](https://github.com/abelljs/abell/blob/main/src/abell-dev-server/) and the code that decides what to reload is at [src/commands/serve.js](https://github.com/abelljs/abell/blob/main/src/commands/serve.js)

Throughout the code you will see a variable called `programInfo` being passed to all the functions. programInfo has all the information related to building a site (directories in the `content`, meta informations of all blogs, etc)

_Note: In most cases, you will not have to understand the whole code and you will mostly need to care about the file related to changes you're making, so even if you don't understand the whole code, that's completely normal and ok_

Thank you and if you need any additional help, you can ask in our [Slack Channel](https://join.slack.com/t/abellland/shared_invite/zt-ebklbe8h-FhRgHxNbuO_hvFDf~nZtGQ) or reach out to me on [Twitter @saurabhcodes](https://twitter.com/saurabhcodes)
