<p align="center"> <img width="600" alt="Cover of Abell" src="https://res.cloudinary.com/saurabhdaware/image/upload/v1588851941/abell/githubhead.png" /> </p>

<p align="center"><a href="https://npmjs.org/package/abell"><img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/abelljs/abell/main?style=for-the-badge&labelColor=black&logo=npm&label=abell&color=darkred"></a> &nbsp;<a href="https://npmjs.org/package/abell-renderer"><img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/abelljs/abell-renderer/main?style=for-the-badge&labelColor=black&logo=npm&label=abell%20renderer&color=darkred"></a> &nbsp;<a href="https://github.com/abelljs/abell/graphs/contributors"><img src="https://img.shields.io/github/contributors/abelljs/abell?style=for-the-badge&labelColor=black&logo=github&color=222222"></a> <br/><a href="https://discord.gg/ndsVpRG"><img src="https://img.shields.io/badge/discord-join%20chat-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB&labelColor=black"/></a>&nbsp; <a href="https://twitter.com/abellland"><img alt="Twitter profile badge of @abellland" src="https://img.shields.io/badge/follow-@AbellLand-1DA1F2?style=for-the-badge&logo=twitter&logoColor=1DA1F2&labelColor=black"/></a> </p>

<p align="center">
  <b><a href="https://abelljs.org">https://abelljs.org</a></b><br/>
  <b>Not ready enough for serious projects. ☠️</b>
</p>
<br/>

a JavaScript based static-site-generator to help you create JSON, Markdown, or static-data based websites with minimal setup in a syntax you almost already know. Built on top of [abelljs/abell-renderer](https://github.com/abelljs/abell-renderer)

**Documentation:** https://abelljs.org

## 📖 &nbsp; Create Abell Project

```sh
npx create-abell-app my-blog
cd my-blog
npm run dev
```

Check out https://abelljs.org for complete documentation.

## 🚀 &nbsp; Syntax Example

```vue
{{
  const a = 'Hello';
  const b = ', World 🌻';
}}

<html>
  <body>
    I can render JavaScript! Look: {{ a + b.toUpperCase() }}
  </body>
</html>
```

This code outputs:

```sh
I can render JavaScript! Look: Hello, WORLD 🌻
```

### 🕐 Changelog

Changelogs are maintained in [CHANGELOG.md](https://github.com/abelljs/abell/blob/main/CHANGELOG.md)

### 🤗 Local Installation & Contributing

Fork [abelljs/abell](https://github.com/abelljs/abell), Then follow these commands

```sh
git clone https://github.com/:github-username/abell # Get a copy of the codebase in your codebase
cd abell
npm install # Installs all the dependencies
npm link # This command will add the current directory to global packages.
cd examples/main # Directory `examples` has sample abell projects.
abell build # command to build project or
abell serve # command to start dev server.
```

We would love to have contributions! The contributing guidelines along with local setup guide is mentioned in [CONTRIBUTING.md](CONTRIBUTING.md)

### 💙 Related Repositories

- [abelljs/abell-website](https://github.com/abelljs/abell-website): Code of Documentation website of Abell (https://abelljs.org)
- [abelljs/abell-renderer](https://github.com/abelljs/abell-renderer): Low-level API that deals with rendering of `.abell` files.

---

[<img alt="Buy me a Coffee Button" width=200 src="https://c5.patreon.com/external/logo/become_a_patron_button.png">](https://www.patreon.com/bePatron?u=31891872) &nbsp; [<img alt="Buy me a Coffee Button" width=200 src="https://cdn.buymeacoffee.com/buttons/default-yellow.png">](https://www.buymeacoffee.com/saurabhdaware)

If you want to know the status and get updates you can follow me on [Twitter @saurabhcodes](https://twitter.com/saurabhcodes)
