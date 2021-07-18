## Single File Components

```jsx
<AbellComponent name="Description">
  <p>{{ props.children }}</p>
</AbellComponent>

<html>
<body>
  <h2>Hello, World</h2>
  <Description>My description text</Description>
</body>
</html>
```

---

## Compile to JS?

```jsx
{{
  function Description(props) {
    return `
      <p>${props.children}</p>
    `
  }
}}

<html>
<body>
  <h2>Hello, World</h2>
  {{ Description({children: 'My description text'}) }}
</body>
</html>
```

---

## Build on top of Vite?

---

## Parsing Component Logic

- parsing component
- executing component code


Executing Component
1. Component Call
```jsx
{{
  const Hello = abellRequire('./component/Hello.abell');
}}
// <Hello props={xyz: 'hi'}>
{{ Hello({xyz: 'hi'}).html }}
```

2. Component Defination
```jsx
<AbellComponent>
  <template><div>Hello {{ props.xyz }}</div></template>
</AbellComponent>
```

3. Component Defination in JS
```js
function abellRequire(abellComponentPath) {
  const abellComponentContent = fs.readFileSync(abellComponentPath, 'utf8');

  // Hello(props).html
  return (props) => {
    const compiledCode = compile(abellComponentContent, {props});
    const template = compiledCode.match(/<template>(.*?)</template>/);
    return {
      html: template
    } 
  };
}
```


```jsx
<AbellComponent>
  <template>
    <div>Hello</div>
  </template>
</AbellComponent>
```

```js
const abellComponentContent = fs.readFileSync(abellComponentPath, 'utf8')

function Hello(props) {
  const compiledCode = compile(abellComponentContent, {props});
  const template = compiledCode.match(/<template>(.*?)</template>/);
  return {
    html: template
  }
}

module.exports = Hello;
```

```js
const Hello = requireAbellComponent(abellComponentPath)
```

```js
function requireAbellComponent(abellComponentPath) {
  const abellComponentContent = fs.readFileSync(abellComponentPath, 'utf8');

  return function AbellComponent(props) {

  }
}
```


How can I get components array before executing component function?

Do I even need this?

How else can I bundle?


A:
We cannot let people use `props` in styles and scripts. It will end up creating different bundles for different calls.