<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/30949385/169687569-a05b87a3-0aa3-4ac3-b8a3-086cc0b8491d.png">
  <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/30949385/169687790-635e044e-0133-4374-b8df-e7cd1c55971d.png">
  <img width="500" alt="Abell Logo and Title" src="https://user-images.githubusercontent.com/30949385/169687790-635e044e-0133-4374-b8df-e7cd1c55971d.png">
</picture>
</p>

<p align="center"><a href="https://npmjs.org/package/abell"><img alt="Abell Latest Version" src="https://img.shields.io/github/package-json/v/abelljs/abell/main?style=for-the-badge&labelColor=322&logo=npm&label=abell&color=darkred"></a> &nbsp;<a href="https://abelljs.org/"><img alt="Documentation abelljs.org" src="https://img.shields.io/badge/Documentation-abelljs.org-3254E9?style=for-the-badge&labelColor=000e60&logo=readthedocs&logoColor=eee"/></a> &nbsp;<a href="https://discord.gg/ndsVpRG"><img alt="Discord Join Chat" src="https://img.shields.io/badge/discord-join%20chat-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB&labelColor=225"/></a></p>

<h1 aria-hidden="true"></h1>

<br/>

> **Warning**
>
> This is not the latest abell code. You will find latest abell code in `main` branch. This is abell v1 code that is currently in development.*

a JavaScript based static-site-generator to help you create JSON, Markdown, or static-data based websites with minimal setup and using a syntax you almost already know.

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

The contributions might get a bit difficult to do right now since I am not quiet clear on which path the Abell is going to go. I will recommend contributing once Abell v1 gets a bit stable.

---

If you like my work, you can sponsor me on GitHub: https://github.com/sponsors/saurabhdaware 🌻