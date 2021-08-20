import { ContentBundle, StyleScriptsBundleInfo } from 'abell-renderer'; // @TODO: change src to dist
import { ProgramInfo } from './build-utils';

type VirtualFileSystemType = Record<
  string,
  {
    content: string;
    componentsInThisBundle: string[];
    bundleName: string;
  }
>;

const virtualFileSystem: VirtualFileSystemType = {};

const writeToVirtualFile = (
  bundleName: string,
  contentBundle: ContentBundle
): void => {
  if (!virtualFileSystem[bundleName]) {
    virtualFileSystem[bundleName] = {
      content: '',
      componentsInThisBundle: [],
      bundleName: ''
    };
  }
  virtualFileSystem[bundleName].componentsInThisBundle.push(
    contentBundle.componentPath
  );
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
    console.dir(bundleInfo, { depth: null });
    for (const scriptBundle of bundleInfo.scripts) {
      writeToVirtualFile('main.abell.js', scriptBundle);
    }

    for (const styleBundle of bundleInfo.styles) {
      writeToVirtualFile('main.abell.css', styleBundle);
    }
  }

  console.log(virtualFileSystem);
}

export default createBundles;
