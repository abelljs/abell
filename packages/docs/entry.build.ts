import { Route } from 'abell';
import { getSponsors } from './utils/getSponsors';

// Layouts
import index from './index.abell';
import webcontainer from './webcontainer.abell';
import docs from './docs.abell';

// Content
import gettingStartedContent from './content/getting-started.mdx';
import syntaxGuide from './content/syntax-guide.mdx';
import customRouting from './content/custom-routing.mdx';
import pluginsAndIntegration from './content/plugins-and-integration.mdx';

// Docs Routes
const docsPaths = [
  {
    path: '/docs/getting-started',
    title: 'Getting Started',
    content: gettingStartedContent
  },
  {
    path: '/docs/syntax-guide',
    title: 'Syntax Guide',
    content: syntaxGuide
  },
  {
    path: '/docs/custom-routing',
    title: 'Custom Routing',
    content: customRouting
  },
  {
    path: '/docs/plugins-and-integrations',
    title: 'Plugins & Integrations',
    content: pluginsAndIntegration
  }
];

const sponsors = await getSponsors();

export const makeRoutes = (): Route[] => {
  return [
    {
      path: '/',
      render: () => index({ sponsors })
    },
    {
      path: '/webcontainer',
      render: () => webcontainer()
    },
    ...docsPaths.map((docPath, index) => ({
      path: docPath.path,
      render: () =>
        docs({
          currentPageIndex: index,
          docsPaths
        })
    }))
  ];
};
