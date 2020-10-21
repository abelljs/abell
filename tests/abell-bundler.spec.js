/* eslint-disable max-len */

const { getComponentBundles } = require('../src/utils/abell-bundler.js');
const expect = require('chai').expect;
const path = require('path');

/* Fake Component Tree for testing */
const fakeComponentTree = [
  {
    renderedHTML:
      '\n  <nav>\n    <div class="brand">This is brand component</div>\n    This is nav component 83\n  </nav>\n',
    components: [
      {
        renderedHTML: '\n  <div class="brand">This is brand component</div>\n',
        components: [],
        styles: [
          {
            component: 'Brand.abell',
            componentPath:
              '/home/saurabh/Desktop/projects/abellorg/abell/examples/with-components/theme/components/Brand.abell',
            content: '\n',
            attributes: {}
          }
        ],
        scripts: [
          {
            component: 'Brand.abell',
            componentPath:
              '/home/saurabh/Desktop/projects/abellorg/abell/examples/with-components/theme/components/Brand.abell',
            content:
              "\n  document.querySelector('div.brand').innerHTML = 'Set from JS';\n",
            attributes: {}
          }
        ]
      }
    ],
    styles: [
      {
        component: 'Nav.abell',
        componentPath:
          '/home/saurabh/Desktop/projects/abellorg/abell/examples/with-components/theme/components/Nav.abell',
        content:
          '\n  nav {\n    background-color: #000;\n    color: #fff;\n  }\n',
        attributes: { inlined: true }
      }
    ],
    scripts: []
  },
  {
    renderedHTML: '\n  <div class="about">\n    Hi I am Abell! \n  </div>\n',
    components: [],
    styles: [
      {
        component: 'Info.abell',
        componentPath:
          '/home/saurabh/Desktop/projects/abellorg/abell/examples/with-components/theme/components/Info.abell',
        content: '\n  .about {\n    color: #999;\n  }\n',
        attributes: {}
      }
    ],
    scripts: [
      {
        component: 'Info.abell',
        componentPath:
          '/home/saurabh/Desktop/projects/abellorg/abell/examples/with-components/theme/components/Info.abell',
        content: '\n',
        attributes: {}
      }
    ]
  }
];

describe('utils/abell-bundler.js', () => {
  describe('#getComponentBundles', () => {
    it('should yeild expected bundle map from component tree', () => {
      const normalizeText = (text) => {
        return text.replace(/\n|\s|\r/g, '');
      };

      const expectedAboutBundleMap = {
        inlinedStyles: { content: '', path: '' },
        inlinedScripts: { content: '', path: '' },
        'inlinedStyles-about.html-0': {
          content:
            '\n  nav {\n    background-color: #000;\n    color: #fff;\n  }\n',
          path: 'inlinedStyles-about.html'
        },
        [`bundled-css${path.sep}main.abell.css-0`]: {
          content: '\n\n  .about {\n    color: #999;\n  }\n',
          path: `bundled-css${path.sep}main.abell.css`
        },
        [`bundled-js${path.sep}main.abell.js-0`]: {
          content:
            "\n  document.querySelector('div.brand').innerHTML = 'Set from JS';\n\n",
          path: `bundled-js${path.sep}main.abell.js`
        }
      };

      // Since css and js is already bundled in separate files in about,
      // it should not be bundled in index.
      // but inlinedStyles should be there
      const expectedIndexBundleMap = {
        inlinedStyles: { content: '', path: '' },
        inlinedScripts: { content: '', path: '' },
        'inlinedStyles-index.html-0': {
          content:
            '\n  nav {\n    background-color: #000;\n    color: #fff;\n  }\n',
          path: 'inlinedStyles-index.html'
        },
        [`bundled-css${path.sep}main.abell.css-0`]: {
          content: '',
          path: 'bundled-css/main.abell.css'
        },
        [`bundled-js${path.sep}main.abell.js-0`]: {
          content: '',
          path: 'bundled-js/main.abell.js'
        }
      };

      const aboutBundleMap = getComponentBundles(
        fakeComponentTree,
        'about.html'
      );

      const indexBundleMap = getComponentBundles(
        fakeComponentTree,
        'index.html'
      );

      Object.keys(aboutBundleMap).forEach((key) => {
        expect(normalizeText(aboutBundleMap[key].content)).to.equal(
          normalizeText(expectedAboutBundleMap[key].content)
        );

        expect(normalizeText(aboutBundleMap[key].path)).to.equal(
          normalizeText(expectedAboutBundleMap[key].path)
        );
      });

      Object.keys(indexBundleMap).forEach((key) => {
        expect(normalizeText(indexBundleMap[key].content)).to.equal(
          normalizeText(expectedIndexBundleMap[key].content)
        );

        expect(normalizeText(indexBundleMap[key].path)).to.equal(
          normalizeText(expectedIndexBundleMap[key].path)
        );
      });
    });
  });
});
