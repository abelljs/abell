import fs from 'fs';
import path from 'path';
import { parseComponent } from '../parsers/abell-component-parser';
import { AbellComponentMap } from '../types';

type TransformationAPI = {
  defined: () => {
    '.abell': (
      abellComponentPath: string
    ) => (props: Record<string, unknown>) => AbellComponentMap;
  };
  getComponents: Array<AbellComponentMap>;
};

/**
 * const transformations = createTransformations();
 */

export function createTransformations(): TransformationAPI {
  const components: AbellComponentMap[] = [];
  return {
    defined: () => {
      const transformations = {
        '.abell': (abellComponentPath: string) => {
          const abellComponentContent = fs.readFileSync(
            path.join(basePath, abellComponentPath),
            'utf-8'
          );

          return (props: Record<string, unknown>) => {
            const parsedComponent = parseComponent(
              abellComponentContent,
              path.join(basePath, abellComponentPath),
              props,
              newOptions
            );
            components.push(parsedComponent);
            return parsedComponent;
          };
        }
      };
      return transformations;
    },
    getComponents: (): AbellComponentMap[] => components
  };
}
