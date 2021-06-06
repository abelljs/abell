import { render } from './index';

const abellString = `
{{
  const a = 3;
  const b = 9;
}}

<b>{{ a + b }}</b>
`;

const htmlString = render(abellString, {}, { allowComponents: false });
console.log(htmlString);
