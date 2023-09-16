import { registerSyntaxHighlighter } from './registerSyntaxHighlighter.js';

// @ts-expect-error: defining it on parent so we don't have to redownload it in ever iframe
window.hljs = registerSyntaxHighlighter();

document
  .querySelectorAll<HTMLButtonElement>('button[data-copydata]')
  .forEach((copyButton) => {
    copyButton.addEventListener('click', () => {
      const copyText = copyButton.dataset.copydata;
      if (copyText) {
        navigator.clipboard.writeText(copyText).then(() => {
          copyButton.classList.add('copied');
          setTimeout(() => {
            copyButton.classList.remove('copied');
          }, 2000);
        });
      }
    });
  });
