import '@fontsource/inter/400.css';
import './global.css';
// import '../components/Editor.jsx';
import '../client/mdxUtils.scss';
import { registerSyntaxHighlighter } from './registerSyntaxHighlighter.js';
// import { WebContainer } from '@webcontainer/api';

const hljs = registerSyntaxHighlighter();

hljs.initHighlightingOnLoad();

// /** @satisfies {import('@webcontainer/api').FileSystemTree} */
// export const files = {
//   'index.abell': {
//     file: {
//       contents: `<div>{{ 2 + 2 }}</div>`
//     }
//   },
//   'package.json': {
//     file: {
//       contents: `
//           {
//             "name": "abell-app",
//             "type": "module",
//             "dependencies": {
//               "abell": "1.0.0-alpha.83"
//             },
//             "scripts": {
//               "start": "abell dev"
//             }
//           }`
//     }
//   }
// };

// const iframeEl = document.querySelector<HTMLIFrameElement>(
//   '.webcontainer iframe'
// );

// const textareaEl = document.querySelector<HTMLTextAreaElement>(
//   '.webcontainer textarea'
// );

// if (!iframeEl || !textareaEl) {
//   throw new Error('no iframe no fun');
// }

// let webcontainerInstance: WebContainer;

// window.addEventListener('load', async () => {
//   if (!textareaEl) return;
//   textareaEl.value = files['index.abell'].file.contents;
//   textareaEl.addEventListener('input', async (e) => {
//     await webcontainerInstance.fs.writeFile(
//       '/index.abell',
//       e.currentTarget?.value
//     );
//   });

//   // Call only once
//   webcontainerInstance = await WebContainer.boot();
//   await webcontainerInstance.mount(files);

//   const exitCode = await installDependencies();
//   if (exitCode !== 0) {
//     throw new Error('Installation failed');
//   }

//   startDevServer();
// });

// async function installDependencies() {
//   // Install dependencies
//   const installProcess = await webcontainerInstance.spawn('npm', ['install']);
//   installProcess.output.pipeTo(
//     new WritableStream({
//       write(data) {
//         console.log(data);
//       }
//     })
//   );
//   // Wait for install command to exit
//   return installProcess.exit;
// }

// async function startDevServer() {
//   // Run `npm run start` to start the Express app
//   const startProcess = await webcontainerInstance.spawn('npm', [
//     'run',
//     'start'
//   ]);
//   startProcess.output.pipeTo(
//     new WritableStream({
//       write(data) {
//         console.log(data);
//       }
//     })
//   );

//   // Wait for `server-ready` event
//   webcontainerInstance.on('server-ready', (port, url) => {
//     if (port === 3000 && iframeEl) {
//       iframeEl.src = url;
//     }
//   });
// }
