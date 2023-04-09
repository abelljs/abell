import { Route } from 'abell';

// Layouts
import index from './index.abell';
import webcontainer from './webcontainer.abell';
import docs from './docs.abell';

// Content
import gettingStartedContent from './content/getting-started.mdx';
import whyAbellContent from './content/why-abell.mdx';

// Docs Routes
const docsPaths = [
  {
    path: '/why-abell',
    title: 'Why Abell',
    content: whyAbellContent
  },
  {
    path: '/getting-started',
    title: 'Getting Started',
    content: gettingStartedContent
  }
];

export const makeRoutes = (): Route[] => {
  return [
    {
      path: '/',
      render: () => `${index()}`
    },
    {
      path: '/webcontainer',
      render: () => webcontainer()
    },
    ...docsPaths.map((docPath) => ({
      path: docPath.path,
      render: () =>
        docs({
          path: docPath.path,
          content: docPath.content,
          docsPaths
        })
    }))
  ];
};
