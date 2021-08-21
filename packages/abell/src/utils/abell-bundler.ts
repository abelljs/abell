import { ContentBundle, StyleScriptsBundleInfo } from 'abell-renderer'; // @TODO: change src to dist
import { rel } from './abell-fs';
import { addToBodyEnd, addToHeadEnd } from './general-utils';

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
  // Id example: src/Home/Hero.abell:0
  return `${rel(componentPath)}:${index}`;
};

const isAlreadyBundled = (bundleName: string, id: string): boolean => {
  if (!virtualFileSystem[bundleName]) {
    return false;
  }

  return virtualFileSystem[bundleName].bundledIds.includes(id);
};

const getBundleName = (
  attributes: Record<string, string>,
  outputPath: string,
  blockType: 'js' | 'css'
): string => {
  let bundleName = '';
  if (attributes.inlined) {
    bundleName = `inlined:${blockType}:${rel(outputPath)}`;
  } else if (attributes.bundle) {
    bundleName = attributes.bundle;
  } else {
    bundleName = `main.abell.${blockType}`;
  }
  return bundleName;
};

type BundleContentProps = {
  contentBlock: ContentBundle;
  blockIndex: string;
  blockType: 'js' | 'css';
  outputPath: string;
};
const bundleContentToVirtualFiles = ({
  contentBlock,
  blockIndex,
  blockType,
  outputPath
}: BundleContentProps) => {
  const bundleName = getBundleName(
    contentBlock.attributes,
    outputPath,
    blockType
  );
  const id = createBlockIdentifier({
    componentPath: contentBlock.componentPath,
    index: blockIndex
  });
  if (!isAlreadyBundled(bundleName, id)) {
    writeToVirtualFile(bundleName, id, contentBlock.content);
  }
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

export const commitVirtualFileSystem = (): void => {
  console.log(virtualFileSystem);
};

type CreateBundleProps = {
  components: StyleScriptsBundleInfo[];
  html: string;
  outputPath: string;
};
function createBundles({
  components,
  html,
  outputPath
}: CreateBundleProps): string {
  // 1. Bundle
  for (const component of components) {
    for (const scriptIndex in component.scripts) {
      const scriptBlock = component.scripts[scriptIndex];
      bundleContentToVirtualFiles({
        contentBlock: scriptBlock,
        blockIndex: scriptIndex,
        blockType: 'js',
        outputPath
      });
    }

    for (const styleIndex in component.styles) {
      const styleBlock = component.styles[styleIndex];
      bundleContentToVirtualFiles({
        contentBlock: styleBlock,
        blockIndex: styleIndex,
        blockType: 'css',
        outputPath
      });
    }
  }

  // 2. Write inlined bundles to HTML output
  let outputHTML = '';
  console.log();
  const inlinedCss =
    virtualFileSystem[`inlined:css:${rel(outputPath)}`]?.content ?? '';

  const inlinedJs =
    virtualFileSystem[`inlined:js:${rel(outputPath)}`]?.content ?? '';

  if (inlinedCss.trim()) {
    outputHTML = addToHeadEnd(`<style>${inlinedCss}</style>`, html);
  }
  if (inlinedJs.trim()) {
    outputHTML = addToBodyEnd(`<script>${inlinedJs}</script>`, outputHTML);
  }

  return outputHTML;
}

export default createBundles;
