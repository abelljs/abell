import '@fontsource/inter/400.css';
// import 'virtual:vite-svg-2-webfont.css';
import './global.css';
import './mdxUtils.scss';
import { registerSyntaxHighlighter } from './registerSyntaxHighlighter.js';

const hljs = registerSyntaxHighlighter();

hljs.initHighlightingOnLoad();

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

const hamburgerMenu = document.querySelector<HTMLButtonElement>(
  '.hamburger-menu'
);
const docsNavbar = document.querySelector<HTMLDivElement>('.docs-navbar');
const navbarOverlay = document.querySelector<HTMLDivElement>(
  'header + .overlay'
);

if (hamburgerMenu && docsNavbar && navbarOverlay) {
  hamburgerMenu.addEventListener('click', () => {
    docsNavbar.classList.toggle('show');
  });
  navbarOverlay.addEventListener('click', () => {
    docsNavbar.classList.remove('show');
  });
}
