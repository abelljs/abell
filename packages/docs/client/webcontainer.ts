import { WebContainer } from '@webcontainer/api';

window.addEventListener('message', (e) => {
  if (!e.data['index.abell']) return;
  initiateWebContainer(e.data);
});

const iframeEl = document.querySelector<HTMLIFrameElement>(
  '.webcontainer iframe'
);

const textareaEl = document.querySelector<HTMLTextAreaElement>(
  '.webcontainer textarea'
);

if (!iframeEl || !textareaEl) {
  throw new Error('no iframe no fun');
}

let webcontainerInstance: WebContainer;

const initiateWebContainer = async (files: Record<string, any>) => {
  if (!textareaEl) return;
  console.log('Initiating web container');
  console.log({ files });

  textareaEl.value = files['index.abell'].file.contents;
  textareaEl.addEventListener('input', async (e) => {
    const fileValue = (e.currentTarget as { value?: string | Uint8Array })
      ?.value;

    if (!fileValue) {
      return;
    }
    await webcontainerInstance.fs.writeFile('/index.abell', fileValue);
  });

  console.log('before boot');
  // Call only once
  webcontainerInstance = await WebContainer.boot();
  console.log('after boot');
  await webcontainerInstance.mount(files);
  console.log('after instance mount');

  const exitCode = await installDependencies();
  if (exitCode !== 0) {
    throw new Error('Installation failed');
  }

  startDevServer();
};

async function installDependencies() {
  // Install dependencies
  console.log('Installing dependencies?');
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);
  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log(data);
      }
    })
  );
  // Wait for install command to exit
  return installProcess.exit;
}

async function startDevServer() {
  // Run `npm run start` to start the Express app
  const startProcess = await webcontainerInstance.spawn('npm', [
    'run',
    'start'
  ]);
  startProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log(data);
      }
    })
  );

  // Wait for `server-ready` event
  webcontainerInstance.on('server-ready', (port, url) => {
    if (port === 3000 && iframeEl) {
      iframeEl.src = url;
    }
  });
}
