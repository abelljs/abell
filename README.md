<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/abelljs/abell/assets/30949385/0452e85b-df57-47a3-891c-33068de5c0e2">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/abelljs/abell/assets/30949385/e9ea17d6-c248-4ef6-9803-fd058b131b4a">
  <img height="200" alt="Abell Logo and Title" src="https://github.com/abelljs/abell/assets/30949385/0452e85b-df57-47a3-891c-33068de5c0e2">
</picture>
</p>

<p align="center"><a href="https://npmjs.org/package/abell"><img alt="Abell Latest Version" src="https://img.shields.io/github/package-json/v/abelljs/abell/main?style=for-the-badge&labelColor=322&logo=npm&label=abell&color=darkred"></a> &nbsp;<a href="https://abelljs.org/"><img alt="Documentation abelljs.org" src="https://img.shields.io/badge/Documentation-abelljs.org-3254E9?style=for-the-badge&labelColor=000e60&logo=readthedocs&logoColor=eee"/></a> &nbsp;<a href="https://discord.gg/ndsVpRG"><img alt="Discord Join Chat" src="https://img.shields.io/badge/discord-join%20chat-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB&labelColor=225"/></a></p>

<h1 aria-hidden="true"></h1>

<br/>

> **Warning**
>
> This is not the latest abell code. You will find latest abell code in `main` branch. This is abell v1 code that is currently in development.

A JavaScript based static-site-generator to help you create JSON, Markdown, or static-data based websites with minimal setup and using a syntax you almost already know.

**Documentation:** https://abelljs.org (v0 documentation)

v1 documentation is in progress. Till then you can check out the example code here - https://stackblitz.com/edit/vitejs-vite-riynxn?file=package.json

## 📖 &nbsp; Create Abell Project

```sh
npx create-abell my-blog
cd my-blog
npm run dev
```

Check out https://abelljs.org for complete documentation.

## 🚀 &nbsp; Syntax Example

```vue
<!-- index.abell -->
<html>
  <body>
    I can render JavaScript! Look: {{ 10 + 10 }}
  </body>
</html>
```

Output:
```html
<!-- index.html -->
<html>
  <body>
    I can render JavaScript! Look: 20
  </body>
</html>
```

### 🤗 Contributing

Check out [CONTRIBUTING.md](https://github.com/abelljs/abell/blob/one/CONTRIBUTING.md)

---

If you like my work, you can sponsor me on GitHub: https://github.com/sponsors/saurabhdaware 🌻
