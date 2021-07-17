// Turn <AbellComponent> into JavaScript
import fs from 'fs';
import { render } from '..';
import { AbellComponentMap } from '../types';

export function parseComponent(
  abellComponentPath: string,
  props: Record<string, unknown>
): {
  renderedHTML: string | AbellComponentMap;
} {
  // TODO: do something better lol
  return {
    renderedHTML: render(fs.readFileSync(abellComponentPath, 'utf-8'))
  };
}
