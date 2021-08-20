import { ContentBundle, StyleScriptsBundleInfo } from 'abell-renderer'; // @TODO: change src to dist
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
}) => {
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
  contentBundle: ContentBundle,
  id: string
): void => {
  if (!virtualFileSystem[bundleName]) {
    virtualFileSystem[bundleName] = {
      content: '',
      bundledIds: [],
      bundleName: ''
    };
  }
  virtualFileSystem[bundleName].bundledIds.push(id);
  virtualFileSystem[bundleName].content += contentBundle.content;
  virtualFileSystem[bundleName].bundleName = bundleName;
};

type CreateBundleProps = {
  bundleInfoArr: StyleScriptsBundleInfo[];
  html: string;
  outputPath: string;
  programInfo: ProgramInfo;
};
function createBundles({
  bundleInfoArr,
  html,
  outputPath,
  programInfo
}: CreateBundleProps): void {
  for (const bundleInfo of bundleInfoArr) {
    for (const scriptIndex in bundleInfo.scripts) {
      const scriptBundle = bundleInfo.scripts[scriptIndex];
      const id = createBlockIdentifier({
        componentPath: scriptBundle.componentPath,
        index: scriptIndex
      });
      if (!isAlreadyBundled('main.abell.js', id)) {
        writeToVirtualFile('main.abell.js', scriptBundle, id);
      }
    }

    for (const styleIndex in bundleInfo.styles) {
      const styleBundle = bundleInfo.styles[styleIndex];
      const id = createBlockIdentifier({
        componentPath: styleBundle.componentPath,
        index: styleIndex
      });
      if (!isAlreadyBundled('main.abell.css', id)) {
        writeToVirtualFile('main.abell.css', styleBundle, id);
      }
    }
  }

  console.log(virtualFileSystem);
}

export default createBundles;
