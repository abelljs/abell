<p align="center"> <img width="600" alt="Cover of Abell" src="https://res.cloudinary.com/saurabhdaware/image/upload/v1588851941/abell/githubhead.png" /> </p>

<p align="center"><a href="https://npmjs.org/package/abell"><img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/abelljs/abell?style=for-the-badge&labelColor=black&logo=npm&label=abell&color=darkred"></a> &nbsp;<a href="https://npmjs.org/package/abell-renderer"><img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/abelljs/abell-renderer?style=for-the-badge&labelColor=black&logo=npm&label=abell%20renderer&color=darkred"></a> &nbsp;<a href="https://github.com/abelljs/abell/graphs/contributors"><img src="https://img.shields.io/github/contributors/abelljs/abell?style=for-the-badge&labelColor=black&logo=github&color=222222"></a> <br/><a href="https://join.slack.com/t/abellland/shared_invite/zt-ebklbe8h-FhRgHxNbuO_hvFDf~nZtGQ"><img src="https://img.shields.io/badge/slack-join%20channel-4A154B?style=for-the-badge&logo=slack&logoColor=pink&labelColor=black"/></a> &nbsp; <a href="https://twitter.com/abellland"><img alt="Twitter profile badge of @abellland" src="https://img.shields.io/badge/follow-@AbellLand-1DA1F2?style=for-the-badge&logo=twitter&logoColor=1DA1F2&labelColor=black"/></a> </p>

<p align="center"><b>NOT READY ENOUGH TO USE IN PRODUCTION. ☠️</b></p>

<p align="center">
  Abell is a static site generator that generates sites in Vanilla HTML, CSS, JavaScript. <br/>Built on top of <a href="https://github.com/abelljs/abell-renderer">abelljs/abell-renderer</a>.
  <br/><br/>
</p>

## 📖 Documentation

_This documentation is only for the people who want to contribute or just want to try it out for fun. Abell should not be used for production applications yet._

For Locally setting up the repository and Contribution Guidelines, check out [CONTRIBUTING.md](CONTRIBUTING.md)

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
- [Changelog](#changelog)

### 1. Create your site

Deploy to netlify button below will create copy of [Abell Starter Project](https://github.com/abelljs/abell-starter-minima) in your GitHub and will deploy it to [Netlify](http://netlify.com/) and boom! that's it 🎉

[![Deploy to Netlify Button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/abelljs/abell-starter-minima)

REMEMBER! **_ABELL IS NOT READY!_** SO DON'T GET TOO EXCITED TO CREATE AN ACTUAL PRODUCTION BLOG WITH THIS.

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
  sourcePath: 'theme', // path of source where index.abell and [$path]/index.abell are located
  destinationPath: 'dist', // Build destination
  contentPath: 'content', // Content Path which has .md
  globalMeta: {
    // All the global variables
    siteName: 'Abell Demo',
    author: 'Saurabh Daware',
    foo: 'bar'
  }
};
```

#### Variables in Abell

Abell lets you use variables inside your .abell files.

- [Content Specific Variables](#content-specific-variables) that can be accessed from `./theme/[$path]/index.abell`.
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

These variables can be accessed from `./theme/[$path]/index.abell` with `{{ meta.title }}`, `{{ meta.description }}`, `{{ meta.foo }}`.

Content also has predefined variables that are mentioned in [predefined variables section](#predefined-variables)

##### Global variables

You can add your variables in `globalMeta` property inside `abell.config.js` file and access those variables from .abell files with `{{ globalMeta.<key> }}` (e.g `{{ globalMeta.siteTitle }}`)

##### Predefined variables

In addition to Content Specific Variables and Global Variables, Abell has some predefined variables to provide required meta data about the content.

Predefined variables start with `$` and are accessible from `.abell` files.

List of predefined variables

| Variables         | description                                  | Example Value                                                                                |
| ----------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| meta.\$slug       | Folder name of content, used as slug         | `my-cool-blog`                                                                               |
| meta.\$createdAt  | Date & Time of creation of content.          | `Sun Apr 30 2020`                                                                            |
| meta.\$modifiedAt | Date & Time of last modification of content. | `Thu May 20 2020`                                                                            |
| \$contentArray    | Array of all 'meta' values from content      | `[{title: 'Cool Blog', $slug: 'my-cool-blog'}, {title: 'Nice blog', $slug: 'nice-blog-69'}]` |

Predefined variables `meta.$createdAt` and `meta.$modifiedAt` can have unexpected changes in some cases, thus for more stable dates, you can overwrite these values by adding new values to the `meta.json` file in `content/:slug/meta.json`

Example `./content/:slug/meta.json`

```json
{
  "title": "Another blog",
  "description": "Amazing blog right",
  "$createdAt": "May 20 2020",
  "modifiedAt": "May 22 2020"
}
```

#### Importing Markdown as HTML

You can import markdown files as HTML in .abell files using `$importContent(path)` function.

In this function, paths are relative to 'content' directory.

**Example:**

```jsx
  <section id="blog-container">
    {{ $importContent(meta.$slug + '/index.md') }}
  </section>
```

This will import the markdown as HTML from `./content/my-blog/index.md`. (where `my-blog` is dynamic)

#### Loops in Abell

Starting from v0.1.12, Abell uses [abell-renderer](https://github.com/abelljs/abell-renderer) for rendering.

You can use JavaScript methods within `{{` and `}}` so to loop through an object and generate HTML, you can use `.map()` method from JavaScript.

_Note: The JavaScript you write inside `{{` and `}}` compiles on build time and runs in NodeJS context so you cannot use frontend JavaScript methods from DOM_

##### Example 1

Let's say we have this object in variable `$contentArray`

```js
// $contentArray
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
];
```

We can loop `$contentArray` with,

```js
<div class="article-container">
{{
  $contentArray
    .map(meta => `
      <article>
        <a href="${meta.$slug}"><h2>${meta.title.toUpperCase()}</h2></a>
        <p>Created at: ${meta.$createdAt}</p>
      </article>
    `).join('')
}}
</div>
```

**outputs:**

```html
<div class="article-container">
  <article>
    <a href="my-cool-blog"><h2>Cool Blog</h2></a>
    <p>Created at: Sun Apr 30 2020</p>
  </article>
  <article>
    <a href="nice-blog-69"><h2>Nice Blog</h2></a>
    <p>Created at: Sun Apr 06 2069</p>
  </article>
</div>
```

##### Example 2

Let's say we have `globalMeta.foo` as,

```js
['Hi I am 1', 'John Doe', 'Lorem Ipsum'];
```

```js
<div>
  {{
    globalMeta.foo
      .map(content => `<b>${content}<b>`)
      .join('')
  }}
</div>
```

**outputs:**

```html
<div>
  <b>Hi I am 1</b>
  <b>John Doe</b>
  <b>Lorem Ipsum</b>
</div>
```

You can also use other JavaScript methods within `{{` `}}`

### Changelog

Changelogs are maintained in [CHANGELOG.md](CHANGELOG.md)

---

[<img alt="Buy me a Coffee Button" width=200 src="https://c5.patreon.com/external/logo/become_a_patron_button.png">](https://www.patreon.com/bePatron?u=31891872) &nbsp; [<img alt="Buy me a Coffee Button" width=200 src="https://cdn.buymeacoffee.com/buttons/default-yellow.png">](https://www.buymeacoffee.com/saurabhdaware)

If you want to know the status and get updates you can follow me on [Twitter @saurabhcodes](https://twitter.com/saurabhcodes)
