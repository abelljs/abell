# Contributing to Abell

This repository contains the code that builds the Abell Website. The code that renders `.abell` files is in [abelljs/abell-renderer](https://github.com/abelljs/abell-renderer). There are also other repositories in this organization that deal with starter-templates, vscode extension for .abell files, etc.

## Local Setup of Abell Builder

- Fork this repository
- `git clone <url of your fork>`
- `cd abell`
- `npm install` to install dependencies
- `npm run dev:build` to build static site!

and you will have your website in `./demo/dist`

To run a DEV server, you can run `npm run dev:serve` which will serve the website on `localhost:5000` by default. You can pass `--port <port>` parameters in command to change port.

`npm run dev:build` is equivalent to `abell build` and `npm run dev:serve` is equivalent to `abell serve`

## Creating Pull Request

- Create a branch with name of feature you are working on. (e.g. `feat-abell-config`, `fix-serve-fails`, etc)
- Make changes in your locally cloned fork
- Send Pull Request from your branch to main of main repository.
