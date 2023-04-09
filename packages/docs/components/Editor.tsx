// React is not bundled on client-side 🤯
// Thanks to https://github.com/bluwy/vite-plugin-iso-import
import React from 'react?server';
import { md } from '../utils/md.js';
import '../client/editor.scss';

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

const getLanguageExtension = (extension: string): string => {
  switch (extension) {
    case 'ts':
      return 'typescript';
    case 'mdx':
      return 'md';
    default:
      return extension;
  }
};

// if (!import.meta.env.SSR) {
//   const textarea = document.querySelectorAll('.textarea');
//   console.log({ textarea });
//   textarea[0].addEventListener('input', () => {
//     console.log('CHANGEDDD');
//   });
// }

export type EditorProps = {
  minHeight: `${string}px`;
  files: Record<string, string>;
  activeFile: string;
  output: Record<`/${string}`, { screen: string }>;
  lineHighlight?: { start?: number; numberOfLines?: number };
};

const EditorFileExplorer = (props: EditorProps) => {
  return (
    <div className="file-explorer">
      <ul>
        {Object.keys(props.files).map((filename) => {
          const languageLogo = getLanguageLogo(filename);
          return (
            <li key={filename} className="flex row">
              <button
                className={`flex row ${
                  filename === props.activeFile ? 'active' : ''
                }`}
                data-filename={filename.replace(/\./g, '-')}
              >
                <img
                  loading="lazy"
                  width={languageLogo.width}
                  src={languageLogo.src}
                />
                <span
                  dangerouslySetInnerHTML={{ __html: languageLogo.space }}
                />
                {filename}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const EditorCodeDisplay = (props: EditorProps): JSX.Element => {
  return (
    <div className="code-display">
      {Object.entries(props.files).map(([filename, filecode]) => {
        const extension = filename.slice(filename.lastIndexOf('.') + 1);
        const language = getLanguageExtension(extension);
        return (
          <div
            key={filename}
            className={`file-${filename.replace(/\./g, '-')} ${
              filename === props.activeFile ? 'show' : ''
            }`}
            dangerouslySetInnerHTML={{
              __html: md(
                // @ts-ignore
                [`~~~${language}\n${filecode}\n~~~`],
                props.lineHighlight?.start,
                props.lineHighlight?.numberOfLines
              )
            }}
          />
        );
      })}
    </div>
  );
};

const EditorCodePreview = (props: EditorProps): JSX.Element => {
  const outPaths = Object.keys(props.output);
  return (
    <div className="code-preview">
      {outPaths.length > 1 ? (
        <div className="url-bar">
          <select>
            {outPaths.map((outPath) => (
              <option key={outPath}>
                http://localhost:3000<span className="path">{outPath}</span>
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="screen">
        {Object.entries(props.output).map(([outPath, outObject]) => (
          <div
            key={outPath}
            className={`path-${outPath.replace(/\//g, '-')} ${
              outPath === '/' ? 'show' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: outObject.screen }}
          />
        ))}
      </div>
    </div>
  );
};

const defaultEditorProps: EditorProps = {
  minHeight: '400px',
  files: {},
  activeFile: '',
  output: { '/': { screen: 'yo' } },
  lineHighlight: { start: undefined, numberOfLines: 1 }
};

const Editor = (editorProps: EditorProps): JSX.Element => {
  const props = {
    ...defaultEditorProps,
    ...editorProps
  };
  return (
    <div className="editor" style={{ minHeight: props.minHeight }}>
      <EditorFileExplorer {...props} />
      <EditorCodeDisplay {...props} />
      <EditorCodePreview {...props} />
    </div>
  );
};

if (!import.meta.env.SSR) {
  // Bundled and runs on Client-side only
  const editors: NodeListOf<HTMLDivElement> =
    document.querySelectorAll('.editor');
  editors.forEach((editor) => {
    const editorFileExplorerButtons: NodeListOf<HTMLButtonElement> =
      editor.querySelectorAll('li button');

    editorFileExplorerButtons.forEach((fileExplorerButton) => {
      fileExplorerButton.addEventListener('click', () => {
        const filename = fileExplorerButton.dataset.filename;
        editor.querySelector('li button.active')?.classList.remove('active');
        fileExplorerButton.classList.add('active');
        editor
          .querySelector('.code-display div.show')
          ?.classList.remove('show');
        editor
          .querySelector(`.code-display div.file-${filename}`)
          ?.classList.add('show');
      });
    });

    const urlBar: HTMLSelectElement | null =
      editor.querySelector('.url-bar > select');

    if (urlBar) {
      urlBar.addEventListener('change', () => {
        const path = urlBar?.value.slice(urlBar.value.lastIndexOf('/'));
        const previewClassName = `path-${path.replace(/\//g, '-')}`;
        const codePreviewScreen = editor.querySelector(
          `.code-preview .screen > div.${previewClassName}`
        );
        editor
          .querySelector(`.code-preview .screen > div.show`)
          ?.classList.remove('show');
        codePreviewScreen?.classList.add('show');
      });
    }
  });
}
// Editor component doesn't end up in bundle 🤯
export default import.meta.env.SSR ? Editor : null;
