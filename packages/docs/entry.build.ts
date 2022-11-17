import { Route } from 'abell';

// Layouts
import index from './index.abell';
import docs from './docs.abell';

// Content
import gettingStartedContent from './content/getting-started.mdx';
import whyAbellContent from './content/why-abell.mdx';

// Docs Routes
const docsPaths = [
  {
    path: '/getting-started',
    title: 'Getting Started',
    content: gettingStartedContent
  },
  {
    path: '/why-abell',
    title: 'Why Abell',
    content: whyAbellContent
  }
];

export const makeRoutes = (): Route[] => {
  return [
    {
      path: '/',
      render: () => `${index()}`
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