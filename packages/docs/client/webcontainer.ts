import { WebContainer } from '@webcontainer/api';
import dedent from 'dedent';

import './editor.scss';
import { registerSyntaxHighlighter } from './registerSyntaxHighlighter.js';

const hljs = registerSyntaxHighlighter();

const makeLoader = ({ loading, text }: { loading: number; text: string }) => {
  const loadingCount = loading / 10;

  return `
  <div class="loader-text" style="font-family: Courier New">
    ${text}
  </div>
  <div 
    class="loader" 
    style="padding: 12px 0px"
  >
    ${Array.from({ length: loadingCount })
      .map(() => '█')
      .join('')}${Array.from({ length: 10 - loadingCount })
      .map(() => '▒')
      .join('')}
  </div>
  `;
};

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
  } else if (filename.endsWith('.css')) {
    languageLogo = {
      src: '/icons/css.png',
      space: '&nbsp;',
      width: 15
    };
  }

  return languageLogo;
};

// CONTAINER RUN CODE
const iframeEl = document.querySelector<HTMLIFrameElement>(
  '.webcontainer iframe'
);

const codeDisplay = document.querySelector<HTMLDivElement>(
  '.webcontainer .code-display'
);

const fileExplorer = document.querySelector<HTMLDivElement>(
  '.webcontainer .file-explorer'
);

const temporaryPreviewEl = document.querySelector<HTMLDivElement>(
  '.webcontainer .temporary-preview'
);

const terminalOutputEl = document.querySelector<HTMLDivElement>(
  '.webcontainer .terminal-output'
);

const editor = document.querySelector<HTMLDivElement>('.editor');

if (!iframeEl || !fileExplorer || !codeDisplay) {
  throw new Error('no iframe no fun');
}

let webcontainerInstance: WebContainer;

let uncommittedChanges: Record<string, string> = {};
let isDevServerLoading = true;
let devServerRetriesAttempted = 0;

const initiateWebContainer = async (webcontainerData: {
  files: Record<string, { file: { contents: string } }>;
  activeFile?: string;
  minHeight?: string;
  showFileExplorer?: boolean;
  output: Record<string, { screen: string }>;
}) => {
  const { files } = webcontainerData;

  if (webcontainerData.showFileExplorer === false) {
    fileExplorer.classList.add('hide');
  }

  if (editor) {
    editor.style.height = webcontainerData.minHeight ?? '';
  }

  if (temporaryPreviewEl) {
    temporaryPreviewEl.innerHTML = webcontainerData.output['/'].screen;
  }

  fileExplorer.innerHTML = '';
  for (const filename of Object.keys(files)) {
    const languageLogo = getLanguageLogo(filename);

    const li = document.createElement('li');
    li.className = 'flex row';
    const button = document.createElement('button');
    button.className = `flex row align-center ${
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
    const codeContainerDiv = document.createElement('div');
    codeContainerDiv.className = `file-${filename.replace(/\./g, '-')} ${
      filename === webcontainerData.activeFile ? 'show' : ''
    }`;
    const fileContent = filename.endsWith('.json')
      ? fileCode.file.contents
      : dedent(fileCode.file.contents);
    codeContainerDiv.innerHTML = `<pre><code contenteditable="true">${
      hljs.highlight(fileContent, {
        language: filename.slice(filename.lastIndexOf('.') + 1)
      }).value
    }</code></pre>`;
    codeDisplay.appendChild(codeContainerDiv);

    const codeElement = codeContainerDiv.querySelector<HTMLElement>('code');

    if (codeElement) {
      codeElement.addEventListener('input', async (e) => {
        const fileValue = (e.currentTarget as { innerText?: string })
          ?.innerText;

        if (!fileValue) {
          return;
        }

        if (isDevServerLoading) {
          uncommittedChanges[filename] = fileValue;
        } else {
          await webcontainerInstance.fs.writeFile(`/${filename}`, fileValue);
        }
      });

      codeElement.addEventListener('blur', () => {
        const codeBlock = codeContainerDiv.querySelector('code');

        if (codeBlock) {
          hljs.highlightBlock(codeBlock);
        }
      });
    }
  }

  let isWebcontainerInitiated = false;

  codeDisplay.addEventListener('click', async () => {
    if (!isWebcontainerInitiated) {
      if (terminalOutputEl) {
        terminalOutputEl.classList.remove('hide-animated');
        terminalOutputEl.innerHTML = makeLoader({
          text: 'Initiating Web Container',
          loading: 10
        });
      }

      // Call only once
      webcontainerInstance = await WebContainer.boot();
      await webcontainerInstance.mount(files);

      isWebcontainerInitiated = true;

      const exitCode = await installDependencies();
      if (exitCode !== 0) {
        throw new Error('Installation failed');
      }

      startDevServer();
    }
  });
};

async function installDependencies() {
  // Install dependencies
  if (terminalOutputEl) {
    terminalOutputEl.innerHTML = makeLoader({
      text: 'Installing Dependencies',
      loading: 40
    });
  }

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
  if (terminalOutputEl) {
    terminalOutputEl.innerHTML = makeLoader({
      text: 'Starting Dev Server',
      loading: 90
    });
  }
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

  startProcess.exit.then((errorCode) => {
    console.log('PROCESS EXITTED!!', errorCode);
    if (terminalOutputEl && errorCode === 1) {
      if (devServerRetriesAttempted < 4) {
        devServerRetriesAttempted++;
        startDevServer();
      } else {
        terminalOutputEl.classList.remove('hide-animated');
        terminalOutputEl.innerHTML = `
          Process Exitted.
          <button class="restart-button">Restart Server</button>
        `;

        document
          .querySelector<HTMLButtonElement>('button.restart-button')
          ?.addEventListener('click', () => {
            devServerRetriesAttempted = 0; // we're only counting auto-restarts. When manual restart happens we reset the counter
            terminalOutputEl.innerHTML = '';
            startDevServer();
          });
      }
    }
  });

  webcontainerInstance.on('error', (err) => {
    if (terminalOutputEl && err.message) {
      let simpleError = err.message;
      if (err.message.includes('ServiceWorkerRegistration')) {
        simpleError = `
            Couldn't connect to Service Worker. 
            Check if your browser allows service worker connection to use 
            live dev-server
          `;
      }
      terminalOutputEl.innerHTML = `
        ${simpleError}
        <button class="restart-button">Restart Server</button>
      `;
    }
  });

  // Wait for `server-ready` event
  webcontainerInstance.on('server-ready', (port, url) => {
    if ([2000, 5000, 8000, 3000].includes(port) && iframeEl) {
      // commit changes that were done before dev-server loaded
      isDevServerLoading = false;
      if (Object.values(uncommittedChanges).length > 0) {
        for (const [filename, source] of Object.entries(uncommittedChanges)) {
          webcontainerInstance.fs.writeFile(`/${filename}`, source);
        }
        uncommittedChanges = {};
      }

      terminalOutputEl?.classList.add('hide-animated');
      temporaryPreviewEl?.classList.add('hide');
      iframeEl.classList.remove('loading');
      iframeEl.src = url;
      iframeEl.removeAttribute('srcdoc');
    }
  });
}

const searchParams = new URLSearchParams(location.search);
const webData = JSON.parse(searchParams.get('data') ?? '');
initiateWebContainer(webData);
