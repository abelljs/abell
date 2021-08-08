import { StyleScriptsBundleInfo } from 'abell-renderer/src/types'; // @TODO: change src to dist

function createBundles(bundleInfoArr: StyleScriptsBundleInfo[]): void {
  for (const bundleInfo of bundleInfoArr) {
    console.dir(bundleInfo, { depth: null });
  }
}

export default createBundles;
