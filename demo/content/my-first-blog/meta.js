function Theme(meta) {
  return /* html */ `
    <div class="theme-container">
      ${meta}
    </div> 
  `.trim();
}

module.exports = {
  title: "My First Blog",
  description: "This is my first blog",
  $createdAt: "May 11 2020",
  Theme
}