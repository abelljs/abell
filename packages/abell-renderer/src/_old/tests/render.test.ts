import path from 'path';
import { render } from '../src/index';

describe('render() - renders abellTemplate into HTML Text', () => {
  describe('# v0.1.x API', () => {
    it('should work.', () => {
      expect(render('{{ 34 + 100 }}', {}, { basePath: '' })).toBe('134');
    });
  });

  describe('# v0.2.x API', () => {
    it('should parse and render components', () => {
      const code = `
        {{
          const Sample = require('./Sample.abell');
        }}
        <body>
          <Sample props={foo: 123}/>
        </body>
      `;

      const { html, components } = render(
        code,
        {},
        {
          basePath: path.join(__dirname, 'examples', 'example2'),
          allowComponents: true,
          dangerouslyAllowRequire: true
        }
      );
      expect(html.trim()).toMatchSnapshot();

      expect(Object.keys(components[0])).toEqual(
        expect.arrayContaining([
          'component',
          'components',
          'filepath',
          'styles',
          'scripts'
        ])
      );
    });
  });

  describe('# JavaScript execution checks', () => {
    it('should return 7 when a function returning 3 + 4 is passed', () => {
      expect(render('{{add}}', { add: (() => 3 + 4)() })).toBe('7');
    });

    it('should return "TEST" if "test".toUpperCase() is renderer ', () => {
      expect(render('{{"test".toUpperCase()}}')).toBe('TEST');
    });
  });

  describe('# Error Handling', () => {
    // eslint-disable-next-line max-len
    it('should execute w/o error and return same string if template has no JS', () => {
      expect(render('hi there this template does not have JS')).toBe(
        'hi there this template does not have JS'
      );
    });

    it('should return nothing when undefined and null is rendered', () => {
      expect(render('{{ undefined }}{{ null }}')).toBe('');
    });

    it('should render 0 and false correctly', () => {
      expect(render('{{ 0 }}{{ false }}')).toBe('0false');
    });

    // eslint-disable-next-line max-len
    it('should ignore the brackets when slash is added before the bracket', () => {
      expect(render('\\{{ This is ignored }}', {})).toBe(
        '{{ This is ignored }}'
      );
    });

    // error handlers

    // eslint-disable-next-line max-len
    it('should throw an error if require() is used without allowRequire: true option', () => {
      const abellTemplate = `
      {{
        const path = require('path');
        const hiHelloPath = require('path').join('hi', 'hello');
      }}
      <div>{{ path.join('hi', 'hello') }} {{ hiHelloPath }}</div>
    `;

      expect(() => render(abellTemplate, {})).toThrowError(
        'require is not defined'
      );
    });

    // eslint-disable-next-line max-len
    it('should throw error at given filename when a variable is not defined', () => {
      expect(() => render('{{ IamUndefined }}', {})).toThrowError(
        'IamUndefined is not defined'
      );

      // Check if error is thrown at given filename
      let errorStackFirstLine = '';
      try {
        render('{{ IamUndefined }}', {}, { filename: 'render.spec.abell' });
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        errorStackFirstLine = err.stack.split('at')[1];
      }
      expect(errorStackFirstLine.trim().startsWith('render.spec.abell:1')).toBe(
        true
      );
    });

    describe('## No undefined', () => {
      it('should not return undefined on calling console.log', () => {
        expect(render('{{ console.log(123) }}', {}).trim()).not.toBe(
          'undefined'
        );
      });

      it('should print empty brackets on undefined', () => {
        expect(render('{{ undefined }}', {}).trim()).toBe('');
      });

      it('should print empty brackets on null', () => {
        expect(render('{{ undefined }}', {}).trim()).toBe('');
      });
    });
  });

  describe('# Possible RegExp issues', () => {
    it('should handle multiple assignments and requires in same block', () => {
      const abellTemplate = `
        {{
          const a = 3;
          const b = 5;
          const path = require('path');
          const hiHelloPath = require('path').join('hi', 'hello');
        }}
        <div>{{ a + b }} {{ path.join('hi', 'hello') }} {{ hiHelloPath }}</div>
      `;

      expect(
        render(abellTemplate, {}, { dangerouslyAllowRequire: true }).trim()
      ).toBe(`<div>8 hi${path.sep}hello hi${path.sep}hello</div>`);
    });

    // eslint-disable-next-line max-len
    it('should be able to handle multiple destructuring assignments', () => {
      const abellTemplate = `
        {{
          const { a } = {a: 3};
          const {b} = {b: 9};
          const e = 10;
          const {c, d} = {c: 6, d:69};
        }}
        {{ a }} {{ b }} {{ c }} {{  d  }} {{ e }}
      `;

      expect(render(abellTemplate, {}).trim()).toBe('3 9 6 69 10');
    });

    it('should handle the case when there is no space around brackets', () => {
      const abellTemplate = `{{a}}`;

      expect(render(abellTemplate, { a: 9 }).trim()).toBe('9');
    });

    // eslint-disable-next-line max-len
    it('should not throw error and return null value if space is passed', () => {
      expect(render('{{ }}', {})).toBe('');
    });
  });

  it('should join array and turn it into a string', () => {
    const abellTemplate = `
    {{
      const a = [1, 2, 3];
    }}
    {{ a }}
    `;
    expect(render(abellTemplate, {}).trim()).toBe('123');
  });
});
