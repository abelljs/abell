const Mustache = require('mustache');

const htmlText = /* html */`
<head>
  <meta name="og:title" content="{{ title }}" />
</head>
<body>
  <header></header>
  <h1>Hey there</h1>
  <main>
    {{ # $contentList }}
      <article>
        <div>{{ title }}</div>
      </article>
    {{ / $contentList }}
  </main>
  <footer></footer>
</body>
`

const out = Mustache.render(
  htmlText, 
  {
    $contentList: [{title: 'Hi'}, {title: 'cool'}],
    title: 'nice'
  }
);


console.log(out);
