import { Route } from 'abell';

// Layouts
import index from './index.abell';
import webcontainer from './webcontainer.abell';
import docs from './docs.abell';

// Content
import whyAbellContent from './content/why-abell.mdx';
import gettingStartedContent from './content/getting-started.mdx';
import syntaxGuide from './content/syntax-guide.mdx';
import customRouting from './content/custom-routing.mdx';
import pluginsAndIntegration from './content/plugins-and-integration.mdx';

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
  },
  {
    path: '/syntax-guide',
    title: 'Syntax Guide',
    content: syntaxGuide
  },
  {
    path: '/custom-routing',
    title: 'Custom Routing',
    content: customRouting
  },
  {
    path: '/plugins-and-integrations',
    title: 'Plugins & Integrations',
    content: pluginsAndIntegration
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
