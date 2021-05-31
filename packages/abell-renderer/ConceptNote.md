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
