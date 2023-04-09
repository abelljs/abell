// if (!import.meta.env.SSR) {
//   window.addEventListener('load', async () => {
//     if (!textareaEl) return;
//     textareaEl.value = files['index.abell'].file.contents;
//     textareaEl.addEventListener('input', async (e) => {
//       await webcontainerInstance.fs.writeFile(
//         '/index.abell',
//         e.currentTarget?.value
//       );
//     });

//     // Call only once
//     webcontainerInstance = await WebContainer.boot();
//     await webcontainerInstance.mount(files);

//     const exitCode = await installDependencies();
//     if (exitCode !== 0) {
//       throw new Error('Installation failed');
//     }

//     startDevServer();
//   });
// }
const files = {
  'index.abell': {
    file: {
      contents: `<div>hi</div>`
    }
  },
  'package.json': {
    file: {
      contents: `
        {
          "name": "abell-app",
          "type": "module",
          "dependencies": {
            "abell": "1.0.0-alpha.83"
          },
          "scripts": {
            "start": "abell dev"
          }
        }`
    }
  }
};

const editors = document.querySelectorAll<HTMLDivElement>('editor');
editors.forEach((editor) => {
  const iframeEl = editor.querySelector<HTMLIFrameElement>('iframe');
  const textareaEl = editor.querySelector<HTMLDivElement>(
    'div[contenteditable="true"]'
  );

  if (!iframeEl || !textareaEl) {
    throw new Error('no iframe no fun');
  }

  textareaEl.addEventListener('input', (e) => {
    console.log('textareaEl change', e.currentTarget);
  });
});

const Editor = (): JSX.Element => {
  return (
    <div className="editor">
      <div contentEditable>Hi</div>
      <div className="preview">
        <iframe className="iframe"></iframe>
      </div>
    </div>
  );
};

export default Editor;
