import { WebContainer } from '@webcontainer/api';
import './editor.scss';

const getLanguageLogo = (
  filename: string
): { src: string; space: string; width: number } => {
  let languageLogo = {
    src: '/icons/abell.ico',
    space: '&nbsp;',
    width: 20
  };
  if (filename === 'package.json') {
    languageLogo = {
      src: '/icons/npm.svg',
      space: '&nbsp;&nbsp;',
      width: 15
    };
  } else if (filename === 'vite.config.ts') {
    languageLogo = {
      src: '/icons/vite.png',
      space: '&nbsp;',
      width: 20
    };
  } else if (filename.endsWith('.mdx')) {
    languageLogo = {
      src: '/icons/mdx.png',
      space: '&nbsp;',
      width: 20
    };
  }

  return languageLogo;
};

window.addEventListener('message', (e) => {
  if (!e.data.files['index.abell']) return;
  console.log('HERE 5');
  initiateWebContainer(e.data);
});

// CONTAINER RUN CODE
const iframeEl = document.querySelector<HTMLIFrameElement>(
  '.webcontainer iframe'
);

const textareaEl = document.querySelector<HTMLDivElement>(
  '.webcontainer div[contenteditable]'
);

const codeDisplay = document.querySelector<HTMLDivElement>(
  '.webcontainer .code-display'
);

const fileExplorer = document.querySelector<HTMLDivElement>(
  '.webcontainer .file-explorer'
);

if (!iframeEl || !textareaEl || !fileExplorer || !codeDisplay) {
  throw new Error('no iframe no fun');
}

let webcontainerInstance: WebContainer;

const initiateWebContainer = async (webcontainerData: Record<string, any>) => {
  const { files } = webcontainerData;

  if (!textareaEl) return;
  console.log('Initiating web container');
  console.log({ files });

  fileExplorer.innerHTML = '';
  for (const filename of Object.keys(files)) {
    const languageLogo = getLanguageLogo(filename);

    const li = document.createElement('li');
    li.className = 'flex row';
    const button = document.createElement('button');
    button.className = `flex row ${
      // eslint-disable-next-line indent
      filename === webcontainerData.activeFile ? 'active' : ''
    }`;
    button.dataset.filename = filename.replace(/\./g, '-');
    button.innerHTML = `
    <img
      loading="lazy"
      width="${languageLogo.width}"
      src="${languageLogo.src}"
    />
    <span>${languageLogo.space}</span>
    ${filename}
    `;

    button.addEventListener('click', () => {
      document
        .querySelector('.file-explorer li button.active')
        ?.classList.remove('active');
      button.classList.add('active');
      document
        .querySelector('.code-display div.show')
        ?.classList.remove('show');
      document
        .querySelector(`.code-display div.file-${button.dataset.filename}`)
        ?.classList.add('show');
    });

    li.appendChild(button);
    fileExplorer.appendChild(li);
  }

  codeDisplay.innerHTML = '';
  for (const [filename, fileCode] of Object.entries(files)) {
    const contentEditableDiv = document.createElement('div');
    contentEditableDiv.contentEditable = 'true';
    contentEditableDiv.className = `file-${filename.replace(/\./g, '-')} ${
      filename === webcontainerData.activeFile ? 'show' : ''
    }`;
    contentEditableDiv.innerHTML = (
      fileCode as { file: { contents: string } }
    ).file.contents
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;')
      .replace(/ /g, '&nbsp;')
      .replace(/\n/g, '<br />');
    codeDisplay.appendChild(contentEditableDiv);

    contentEditableDiv.addEventListener('input', async (e) => {
      const fileValue = (e.currentTarget as { innerText?: string | Uint8Array })
        ?.innerText;

      if (!fileValue) {
        return;
      }
      await webcontainerInstance.fs.writeFile(filename, fileValue);
    });
  }

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

// Syntax Highlighter
