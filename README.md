# Abell

![GitHub package.json version](https://img.shields.io/github/package-json/v/abelljs/abell?style=for-the-badge)

Abell is a static blog generator that generates blog in Vanilla JavaScript


***NOT READY ENOUGH TO USE IN PRODUCTION. ☠️***

The API is not finallised so I will be breaking the functionity a lot. 

## 📖 Documentation for Contributors

*This documentation is only for the people who want to help me in making Abell!*

### Table of Content

- [Create your site](#1-create-your-site)
  - [Write/Edit Content](#writeedit-content)
  - [Run your site locally](#run-your-site-locally)
- [Abell Guide](#2-abell-guide)
  - [Abell Configs](#abell-configs)
  - [Variables in Abell](#variables-in-abell)
    - [Content Specific Variables](#content-specific-variables)
    - [Global Variables](#global-variables)
    - [Predefined Variables](#predefined-variables)
  - [Loops in Abell](#loops-in-abell)
    - [Example 1](#example-1)
    - [Example 2](#example-2)
- [Contributing to Abell](#3-contributing-to-abell)
  - [Local Setup of Abell Builder](#local-setup-of-abell-builder)
  - [Creating Pull Request](#creating-pull-request)
  

### 1. Create your site
Deploy to netlify button below will create copy of [Abell Starter Project](https://github.com/abelljs/abell-starter-minima) in your GitHub and will deploy it to [Netlify](http://netlify.com/) and boom! that's it 🎉

[![Deploy to Netlify Button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/abelljs/abell-starter-minima)

REMEMBER! ***ABELL IS NOT READY!*** SO DON'T GET TOO EXCITED TO CREATE AN ACTUAL PRODUCTION BLOG WITH THIS.


#### Write/Edit Content
You can edit markdown files from `./content` directory in your repo to edit content.

To test your blog, you can either [run your site locally](#1b-run-your-blog-locally) or open your site's github repository in [CodeSandbox](http://codesandbox.io/)

#### Run your site locally

- You can `git clone <project-github-url>`
- `cd <project-name>`
- `npm install`
- `npm run dev` to run a dev server and `npm run build` to create final build.

### 2. Abell Guide

#### Abell Configs
Sample abell.config.js:
```js
module.exports = {
  sourcePath: 'src', // path of source where index.abell and [content]/index.abell are located
  destinationPath: 'dist', // Build destination
  contentPath: 'content', // Content Path which has .md 
  globalMeta: { // All the global variables
    siteName: 'Abell Demo', 
    author: 'Saurabh Daware',
    foo: 'bar'
  }
}
```


#### Variables in Abell

Abell lets you use variables inside your .abell files. 
- [Content Specific Variables](#content-specific-variables) that can be accessed from `./src/[content]/index.abell`.
- There are [Global Variables](#global-variables) that can be accessed from any .abell files with `{{ globalMeta.<key> }}`.
- [Predefined Variables](#predefined-variables)

##### Content specific variables
Your content may sometimes have meta data like title, og:image, etc. which is dynamic (different for different content). You can set this meta info from `./content/<content-slug>/meta.json`.

Example `./content/<content-slug>/meta.json`
```json
{
  "title": "Another blog",
  "description": "Amazing blog right",
  "foo": "bar"
}
```

These variables can be accessed from `./src/[content]/index.abell` with `{{ meta.title }}`, `{{ meta.description }}`, `{{ meta.foo }}`

##### Global variables

You can add your variables in `globalMeta` property inside `abell.config.js` file and access those variables from .abell files with `{{ globalMeta.<key> }}` (e.g `{{ globalMeta.siteTitle }}`)


##### Predefined variables

In addition to Content Specific Variables and Global Variables, Abell has some predefined variables to provide required meta data about the content. 

Predefined variables start with `$` and are accessible from `.abell` files.

List of predefined variables

| Variables        | description                                   | Example Value          |
|------------------|-----------------------------------------------|------------------------|
| meta.$slug       | Folder name of content, used as slug          | `my-cool-blog`           |
| meta.$createdAt  | Date & Time of creation of content.           | `Sun Apr 30 2020`        |
| meta.$modifiedAt | Date & Time of last modification of content.  | `Thu May 20 2020`        |
| $contentList     | Array of all 'meta' values from content       | `[{title: 'Cool Blog', $slug: 'my-cool-blog'}, {title: 'Nice blog', $slug: 'nice-blog-69'}]` |



#### Loops in Abell


Abell internally uses [Mustache](https://github.com/janl/mustache.js) for rendering. Thus everything that can done in Mustache is possible in .abell files as well.

##### Example 1
Let's say we have this object in variable `$contentList`
```js
// $contentList
[
  {
    title: 'Cool Blog', 
    $slug: 'my-cool-blog',
    $createdAt: 'Sun Apr 30 2020',
    $modifiedAt: 'Wed May 10 2020'
  }, 
  {
    title: 'Nice blog', 
    $slug: 'nice-blog-69',
    $createdAt: 'Sun Apr 06 2069',
    $modifiedAt: 'Wed May 09 2069'
  }
]
```

We can loop `$contentList` with,

```html
{{ # $contentList }}
  <article>
    <a href="{{$slug}}"><h2>{{title}}</h2></a>
    <p>Created at: {{$createdAt}}</p>
  </article>
{{ / $contentList }}
```

##### Example 2


Let's say we have `globalMeta.foo` as,
```js
['Hi I am 1', 'John Doe', 'Lorem Ipsum']
```

We can loop normal arrays using dot to refer the value.

```html

{{ # globalMeta.foo }}
  <b>{{ . }}</b>
{{ / globalMeta.foo }}
```



### 3. Contributing to Abell

This repository contains the code that builds the Abell Website. If you want you can also contribute to other repositories in this organization that deal with starter-templates, vscode extension for .abell files, etc.

#### Local Setup of Abell Builder
- Fork this repository
- `git clone {url of your fork}`
- `cd abell`
- `npm install` to install dependencies
- `npm run dev:build` to build static site! 

and you will have your wesite in `./demo/dist`

To run a DEV server, you can run `npm run dev:serve` which will serve the website on `localhost`

#### Creating Pull Request
- Create a branch with name of feature you are working on. (e.g. `feat-abell-config`, `fix-serve-fails`, etc)
- Make changes in your locally cloned fork
- Send Pull Request from your branch to master of main repository.

`npm run dev:build` is equivalent to `abell build` and `npm run dev:serve` is equivalent to `abell serve` 


If you want to know the status and get updates you can follow me on [Twitter @saurabhcodes](https://twitter.com/saurabhcodes)