import fs from 'fs';
import path from 'path';
import { ContentBundle, StyleScriptsBundleInfo } from 'abell-renderer'; // @TODO: change src to dist
import { createPathIfAbsent, rel } from './abell-fs';
import { addToBodyEnd, addToHeadEnd } from './general-utils';

type VirtualFileSystemType = Record<
  string,
  {
    content: string;
    bundledIds: string[];
    bundleName: string;
  }
>;

let virtualFileSystem: VirtualFileSystemType = {};

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
  relativeHTMLOutputPath: string,
  blockType: 'js' | 'css'
): string => {
  const htmlPathKey = relativeHTMLOutputPath
    .replace(/\//g, '-')
    .replace('.html', '');
  let bundleName = '';
  if (attributes.inlined) {
    bundleName = `inlined:${blockType}:${htmlPathKey}`;
  } else if (attributes.bundle) {
    bundleName =
      attributes.bundle.replace(blockType, '') + htmlPathKey + '.' + blockType;
  } else {
    bundleName = `main.abell.${htmlPathKey}.${blockType}`;
  }
  return bundleName;
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

export const commitVirtualFileSystem = (outputPath: string): void => {
  const ABELL_OUTPUT_BUNDLES_DIR = path.join(outputPath, 'abell-bundles');
  for (const virtualFile of Object.values(virtualFileSystem)) {
    if (virtualFile.bundleName.startsWith('inlined:')) {
      continue;
    }
    const bundleOutputPath = path.join(
      ABELL_OUTPUT_BUNDLES_DIR,
      virtualFile.bundleName
    );
    createPathIfAbsent(ABELL_OUTPUT_BUNDLES_DIR);
    fs.writeFileSync(bundleOutputPath, virtualFile.content);
  }
};

type BundleContentProps = {
  contentBlock: ContentBundle;
  blockIndex: string;
  blockType: 'js' | 'css';
  relativeHTMLOutputPath: string;
};
const bundleContentToVirtualFiles = ({
  contentBlock,
  blockIndex,
  blockType,
  relativeHTMLOutputPath
}: BundleContentProps) => {
  const bundleName = getBundleName(
    contentBlock.attributes,
    relativeHTMLOutputPath,
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

type CreateBundleProps = {
  components: StyleScriptsBundleInfo[];
  html: string;
  htmlOutputPath: string;
  outputPath: string;
};
function createBundles({
  components,
  html,
  htmlOutputPath,
  outputPath
}: CreateBundleProps): string {
  // @TODO:
  // Forgot to handle nested components lol ;__;
  // 1. Bundle
  virtualFileSystem = {};
  const relativeHTMLOutputPath = path.relative(outputPath, htmlOutputPath);
  for (const component of components) {
    console.log(component);
    for (const scriptIndex in component.scripts) {
      const scriptBlock = component.scripts[scriptIndex];
      bundleContentToVirtualFiles({
        contentBlock: scriptBlock,
        blockIndex: scriptIndex,
        blockType: 'js',
        relativeHTMLOutputPath
      });
    }

    for (const styleIndex in component.styles) {
      const styleBlock = component.styles[styleIndex];
      bundleContentToVirtualFiles({
        contentBlock: styleBlock,
        blockIndex: styleIndex,
        blockType: 'css',
        relativeHTMLOutputPath
      });
    }
  }

  commitVirtualFileSystem(outputPath);

  // 2. Write inlined bundles to HTML output
  let outputHTML = html;
  let contentThatGoesToHeadEnd = '';
  console.log(Object.keys(virtualFileSystem));
  const inlinedCss =
    virtualFileSystem[
      getBundleName({ inlined: 'true' }, relativeHTMLOutputPath, 'css')
    ]?.content ?? '';

  const inlinedJs =
    virtualFileSystem[
      getBundleName({ inlined: 'true' }, relativeHTMLOutputPath, 'js')
    ]?.content ?? '';

  contentThatGoesToHeadEnd = `<style>${inlinedCss}</style>`;

  if (inlinedCss.trim()) {
    outputHTML = addToHeadEnd(contentThatGoesToHeadEnd, html);
  }
  if (inlinedJs.trim()) {
    outputHTML = addToBodyEnd(`<script>${inlinedJs}</script>`, outputHTML);
  }

  return outputHTML;
}

export default createBundles;
