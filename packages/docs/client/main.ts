import '@fontsource/inter/variable.css';
import 'highlight.js/styles/github.css';
import './global.css';

const editors: NodeListOf<HTMLDivElement> = document.querySelectorAll('.editor');
editors.forEach((editor) => {
  const editorFileExplorerButtons: NodeListOf<HTMLButtonElement> = editor.querySelectorAll('li button');

  editorFileExplorerButtons.forEach((fileExplorerButton) => {
    fileExplorerButton.addEventListener('click', () => {
      const filename = fileExplorerButton.dataset.filename;
      editor.querySelector('li button.active')?.classList.remove('active');
      fileExplorerButton.classList.add('active');
      editor.querySelector('.code-display div.show')?.classList.remove('show');
      editor.querySelector(`.code-display div.file-${filename}`)?.classList.add('show');
    })
  });

  const urlBar: HTMLSelectElement | null = editor.querySelector('.url-bar > select');

  if (urlBar) {
    urlBar.addEventListener('change', (e) => {
      const path = urlBar?.value.slice(urlBar.value.lastIndexOf('/'));
      const previewClassName = `path-${path.replace(/\//g, '-')}`;
      const codePreviewScreen = editor.querySelector(`.code-preview .screen > div.${previewClassName}`);
      editor.querySelector(`.code-preview .screen > div.show`)?.classList.remove('show');
      codePreviewScreen?.classList.add('show');
    })
  }
});