document.querySelector('#counter-button').addEventListener('click', () => {
  const countEl = document.querySelector('#count');
  countEl.innerText = Number(countEl.innerText) + 1;
});
