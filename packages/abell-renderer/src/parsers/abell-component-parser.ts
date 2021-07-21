import fs from 'fs';
import path from 'path';
import {
  OutputWithComponent,
  StyleScriptsBundleInfo,
  UserOptions
} from '../types';
import {
  execRegexOnAll,
  getAbellInBuiltSandbox,
  normalizePath,
  prefixHtmlTags
} from '../utils/general-utils';
import hash from '../utils/hash';
import { compile } from '../compiler';
import { cssSerializer } from './css-parser';

type AbellComponentContext = {
  AbellComponentCall: (props: Record<string, unknown>) => OutputWithComponent;
  getComponentBundleMap: () => StyleScriptsBundleInfo;
};

function parseAttributes(attrString: string): Record<string, unknown> {
  const attributeMatches = attrString.match(/(?:[^\s"']+|(["'])[^"]*\1)+/g);
  if (!attributeMatches) {
    return {};
  }

  return attributeMatches.reduce((prevObj, val) => {
    const firstEqual = val.indexOf('=');
    if (firstEqual < 0) {
      return {
        ...prevObj,
        [val]: true
      };
    }
    const key = val.slice(0, firstEqual);
    let value = val.slice(firstEqual + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    return {
      ...prevObj,
      [key]: value
    };
  }, {});
}

function getStyleScriptMatches(
  abellComponentPath: string,
  abellComponentContent: string,
  componentHash: string
) {
  const matchMapper = (isCss: boolean) => (contentMatch: string[]) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, blockAttributes, blockContent] = contentMatch;
    const attributes = parseAttributes(blockAttributes);
    const shouldPrefix = isCss && !attributes.global;

    let content;
    if (shouldPrefix) {
      // if it is css then scope it by appending hash to css selector
      content = cssSerializer(blockContent, componentHash);
    } else if (!isCss && blockContent.includes('scopedSelector')) {
      // if it is javascript then scope it by injecting scopedSelector functions
      content = blockContent.replace(
        /scoped(Selector|SelectorAll)\((['"`].*?["'`])\)/g,
        `document.query$1($2 + "[data-abell-${componentHash}]")`
      );
    } else {
      content = blockContent;
    }

    return {
      component: path.basename(abellComponentPath),
      componentPath: abellComponentPath,
      content,
      attributes: parseAttributes(blockAttributes)
    };
  };

  const styleMatches = execRegexOnAll(
    /\<style(.*?)\>(.*?)\<\/style\>/gs,
    abellComponentContent
  ).matches.map(matchMapper(true));

  const scriptMatches = execRegexOnAll(
    /\<script(.*?)\>(.*?)\<\/script\>/gs,
    abellComponentContent
  ).matches.map(matchMapper(false));

  return { styleMatches, scriptMatches };
}

export function createAbellComponentContext(
  abellComponentPath: string,
  options: UserOptions
): AbellComponentContext {
  // Runs when the abell component require is called
  let componentBundleMap: Record<string, unknown> = {};

  const basePath = path.dirname(abellComponentPath);
  const filename = path.relative(process.cwd(), abellComponentPath);
  const newOptions = {
    ...options,
    filename,
    basePath
  };
  let abellComponentContent = fs.readFileSync(abellComponentPath, 'utf8');

  // Add styles and scripts to component bundle map

  // we use the relative path here so that hash doesn't change across machines
  const componentHash = hash(
    normalizePath(path.relative(process.cwd(), abellComponentPath))
  );

  const { scriptMatches, styleMatches } = getStyleScriptMatches(
    abellComponentPath,
    abellComponentContent,
    componentHash
  );

  const isStyleGlobal =
    styleMatches.length <= 0 ||
    styleMatches.every((styleMatch) => styleMatch.attributes.global === true);

  if (options && !isStyleGlobal) {
    // ignore adding scope hash
    // TODO: only prefix HTML tags inside the template tagx
    abellComponentContent = prefixHtmlTags(
      abellComponentContent,
      componentHash
    );
  }

  componentBundleMap = {
    component: path.basename(filename),
    filepath: filename,
    scripts: scriptMatches,
    styles: styleMatches,
    components: []
  };

  return {
    // The function that gets called when we do <Hello props={xyz: 'hi'} />
    AbellComponentCall: (props: Record<string, unknown>) => {
      const componentMap = parseComponent(
        abellComponentContent,
        props,
        newOptions
      );

      // populate component bundle map with information
      componentBundleMap.components = componentMap.components;
      return componentMap;
    },
    getComponentBundleMap: () => componentBundleMap
  };
}

export function parseComponent(
  abellComponentContent: string,
  props: Record<string, unknown>,
  options: UserOptions
): OutputWithComponent {
  const { builtInFunctions, subComponents } = getAbellInBuiltSandbox(options);
  const sandbox = {
    props,
    ...builtInFunctions
  };
  const compiledComponentContent = compile(
    abellComponentContent,
    sandbox,
    options
  );

  const templateTag = compiledComponentContent.match(
    /\<template.*?>(.*?)\<\/template>/s // TODO: remove .*? from template tag
  );

  return {
    html: templateTag?.[1] ?? '',
    components: subComponents
  };
}

/**
 * TODO:
 * - Add typescript support to css-parser, and hash
 * -
 *
 */
