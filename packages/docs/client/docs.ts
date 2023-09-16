import 'highlight.js/styles/github.css';

// Handle mobile ham menu
const hamburgerMenu =
  document.querySelector<HTMLButtonElement>('.hamburger-menu');
const docsNavbar = document.querySelector<HTMLDivElement>('.docs-navbar');
const navbarOverlay =
  document.querySelector<HTMLDivElement>('header + .overlay');

hamburgerMenu?.addEventListener('click', () => {
  docsNavbar?.classList.toggle('show');
});
navbarOverlay?.addEventListener('click', () => {
  docsNavbar?.classList.remove('show');
});

// Make subheadings
const subheadings = document.querySelectorAll<HTMLHeadingElement>('h2, h3');

const observer = new IntersectionObserver(() => {
  subheadings.forEach((subheading) => {
    const anchor = document.querySelector(
      `.submenu a[href="#${subheading.id}"]`
    );

    if (!anchor) {
      return;
    }

    if (subheading.getBoundingClientRect().top < 20) {
      anchor.classList.add('done');
    } else {
      anchor.classList.remove('done');
    }
  });
});

const subMenuContainer = document.querySelector<HTMLUListElement>('.submenu');
let subMenuLists = '';
subheadings.forEach((subheading) => {
  const text = subheading.innerText;

  const id = text.toLowerCase().replace(/ /g, '-');
  subheading.id = id;
  subheading.innerHTML = subheading.innerHTML + `<a href="#${id}">#</a>`;
  subMenuLists += `
    <li>
      <a href="#${id}">
        <div>
          <i class="dash">-</i>
          <i class="icon icon-check"></i>
        </div>
        <span class="menu-text">${text}</span>
      </a>
    </li>
  `;
  observer.observe(subheading);
});

if (subMenuContainer) {
  subMenuContainer.innerHTML = subMenuLists;
  document
    ?.querySelectorAll<HTMLAnchorElement>('.submenu li > a')
    .forEach((submenuAnchor) => {
      submenuAnchor.addEventListener('click', () => {
        docsNavbar?.classList.remove('show');
      });
    });
}
