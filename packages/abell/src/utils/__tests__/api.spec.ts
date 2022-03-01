// import { test, describe, expect } from 'vitest';
// import { makeRoutesFromGlobImport } from '../api';
// import { prefix } from './test-utils';

// describe('makeRoutesFromGlobImport()', () => {
//   test('should return relative abell files', () => {
//     const abellPages = {
//       './src/index.abell': {
//         default: () => 'hehe'
//       },
//       './src/about.abell': {
//         default: () => 'hehe'
//       },
//       './src/nested/index.abell': {
//         default: () => 'hehe'
//       }
//     };
//     expect(findAbellFileFromURL('/', abellPages)).toBe('./src/index.abell');
//     expect(findAbellFileFromURL('/about', abellPages)).toBe(
//       './src/about.abell'
//     );
//     expect(findAbellFileFromURL('/nested', abellPages)).toBe(
//       './src/nested/index.abell'
//     );
//   });

//   test('should return absolute abell files', () => {
//     const abellPages = {
//       [prefix('./src/index.abell')]: {
//         default: () => 'hehe'
//       },
//       [prefix('./src/about.abell')]: {
//         default: () => 'hehe'
//       },
//       [prefix('./src/nested/index.abell')]: {
//         default: () => 'hehe'
//       }
//     };
//     expect(findAbellFileFromURL('/', abellPages)).toBe(
//       prefix('./src/index.abell')
//     );
//     expect(findAbellFileFromURL('/about', abellPages)).toBe(
//       prefix('./src/about.abell')
//     );
//     expect(findAbellFileFromURL('/nested', abellPages)).toBe(
//       prefix('./src/nested/index.abell')
//     );
//   });
// });
