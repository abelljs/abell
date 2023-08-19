import './docs.css';
import '@fontsource/inter/600.css';

// Handle mobile ham menu
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

// Make subheadings
const subheadings = document.querySelectorAll<HTMLHeadingElement>('h2, h3');
subheadings.forEach((subheading) => {
  const text = subheading.innerText;
  const id = text.toLowerCase().replace(/ /g, '-');
  subheading.id = id;
  subheading.innerHTML = subheading.innerHTML + `<a href="#${id}">#</a>`;
  console.log({ text, id });
});
