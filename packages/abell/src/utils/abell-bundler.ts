import { StyleScriptsBundleInfo } from 'abell-renderer'; // @TODO: change src to dist
import { ProgramInfo } from './build-utils';

type VirtualFileSystemType = Record<
  string,
  {
    content: string;
    bundledIds: string[];
    bundleName: string;
  }
>;

const virtualFileSystem: VirtualFileSystemType = {};

const createBlockIdentifier = ({
  componentPath,
  index
}: {
  componentPath: string;
  index: string;
}): string => {
  return `${componentPath}-${index}`;
};

const isAlreadyBundled = (bundleName: string, id: string): boolean => {
  if (!virtualFileSystem[bundleName]) {
    return false;
  }

  return virtualFileSystem[bundleName].bundledIds.includes(id);
};

const writeToVirtualFile = (
  bundleName: string,
  id: string,
  content: string
): void => {
  if (!virtualFileSystem[bundleName]) {
    virtualFileSystem[bundleName] = {
      content: '',
      bundledIds: [],
      bundleName: ''
    };
  }
  virtualFileSystem[bundleName].bundledIds.push(id);
  virtualFileSystem[bundleName].content += content;
  virtualFileSystem[bundleName].bundleName = bundleName;
};

type CreateBundleProps = {
  components: StyleScriptsBundleInfo[];
  html: string;
  outputPath: string;
  programInfo: ProgramInfo;
};
function createBundles({
  components,
  html,
  outputPath,
  programInfo
}: CreateBundleProps): void {
  for (const component of components) {
    for (const scriptIndex in component.scripts) {
      const scriptBlock = component.scripts[scriptIndex];
      const id = createBlockIdentifier({
        componentPath: scriptBlock.componentPath,
        index: scriptIndex
      });
      if (!isAlreadyBundled('main.abell.js', id)) {
        writeToVirtualFile('main.abell.js', id, scriptBlock.content);
      }
    }

    for (const styleIndex in component.styles) {
      const styleBlock = component.styles[styleIndex];
      const id = createBlockIdentifier({
        componentPath: styleBlock.componentPath,
        index: styleIndex
      });
      if (!isAlreadyBundled('main.abell.css', id)) {
        writeToVirtualFile('main.abell.css', id, styleBlock.content);
      }
    }
  }

  console.log(virtualFileSystem);
}

export default createBundles;
