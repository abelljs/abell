import { Route } from 'abell';
import index from './index.abell';
import docs from './docs.abell';

const contentMd = import.meta.glob<{
  default: string;
  attributes: Record<string, string>;
}>('./content/*.md', {
  eager: true
});

const filePathToURL = (filePath: string, base = './content') => {
  return filePath.replace(`${base}/`, '/').replace('.md', '');
};

const docsPaths = Object.entries(contentMd)
  .sort(
    ([_, a], [_x, b]) => Number(a.attributes.index) - Number(b.attributes.index)
  )
  .map(([mdPath, mdModule]) => ({
    path: filePathToURL(mdPath),
    menuTitle: mdModule.attributes.menu
  }));

const docsRoutes: Route[] = Object.entries(contentMd).map(
  ([mdPath, mdModule]) => {
    const path = filePathToURL(mdPath);
    return {
      path,
      render: () =>
        docs({
          content: mdModule.default,
          attributes: mdModule.attributes,
          docsPaths,
          path
        })
    };
  }
);

export const makeRoutes = (): Route[] => {
  return [
    {
      path: '/',
      render: index
    },
    ...docsRoutes
  ];
};
