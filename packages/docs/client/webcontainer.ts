import { WebContainer } from '@webcontainer/api';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
// import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github.css';
import dedent from 'dedent';

import { abellHighlighter } from '../utils/abell-syntax-highlighter';
import './editor.scss';

hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('javascript', typescript);
hljs.registerAliases('js', { languageName: 'javascript' });
hljs.registerLanguage('json', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('abell', abellHighlighter);

const makeLoader = ({ loading, text }: { loading: number; text: string }) => {
  const loadingCount = loading / 10;

  return `
  <div class="loader-text" style="font-family: Courier New">
    ${text}
  </div>
  <div 
    class="loader" 
    style="font-family: Courier New; font-size: 1.2rem; padding: 12px 0px"
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

const codeDisplay = document.querySelector<HTMLDivElement>(
  '.webcontainer .code-display'
);

const fileExplorer = document.querySelector<HTMLDivElement>(
  '.webcontainer .file-explorer'
);

const editor = document.querySelector<HTMLDivElement>('.editor');

if (!iframeEl || !fileExplorer || !codeDisplay) {
  throw new Error('no iframe no fun');
}

let webcontainerInstance: WebContainer;

const initiateWebContainer = async (webcontainerData: {
  files: Record<string, { file: { contents: string } }>;
  activeFile?: string;
  minHeight?: string;
}) => {
  const { files } = webcontainerData;

  if (editor) {
    editor.style.minHeight = webcontainerData.minHeight ?? '';
  }

  if (iframeEl) {
    iframeEl.srcdoc = makeLoader({
      text: 'Initiating Web Container',
      loading: 10
    });
  }

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
    contentEditableDiv.innerHTML = `<pre><code>${dedent(
      hljs.highlight(fileCode.file.contents, {
        language: filename.slice(filename.lastIndexOf('.') + 1)
      }).value
    )}</code></pre>`;
    codeDisplay.appendChild(contentEditableDiv);

    contentEditableDiv.addEventListener('input', async (e) => {
      const fileValue = (e.currentTarget as { innerText?: string })?.innerText;

      if (!fileValue) {
        return;
      }

      await webcontainerInstance.fs.writeFile(`/${filename}`, fileValue);
    });
  }

  // Call only once
  webcontainerInstance = await WebContainer.boot();
  await webcontainerInstance.mount(files);

  const exitCode = await installDependencies();
  if (exitCode !== 0) {
    throw new Error('Installation failed');
  }

  startDevServer();
};

async function installDependencies() {
  // Install dependencies
  if (iframeEl) {
    iframeEl.srcdoc = iframeEl.srcdoc = makeLoader({
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
  if (iframeEl) {
    iframeEl.srcdoc = iframeEl.srcdoc = makeLoader({
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

  // Wait for `server-ready` event
  webcontainerInstance.on('server-ready', (port, url) => {
    if (port === 3000 && iframeEl) {
      iframeEl.src = url;
      iframeEl.removeAttribute('srcdoc');
    }
  });
}

// Syntax Highlighter
