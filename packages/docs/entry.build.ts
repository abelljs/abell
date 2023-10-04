import { Route } from 'abell';
import { getSponsors } from './utils/getSponsors';

// Layouts
import index from './index.abell';
import webcontainer from './webcontainer.abell';
import docs from './docs.abell';

// Content
import whyAbell from './content/why-abell.mdx';
import gettingStartedContent from './content/getting-started.mdx';
import syntaxGuide from './content/syntax-guide.mdx';
import customRouting from './content/custom-routing.mdx';
import pluginsAndIntegration from './content/plugins-and-integration.mdx';
import { getContributors } from './utils/getContributors.js';

// Docs Routes
const docsPaths = [
  {
    path: '/docs/why-abell',
    title: 'Why Abell',
    content: whyAbell
  },
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
const contributors = await getContributors();

// const archivedRepoContributions = await Promise.all([
//   getRepoContributions('abell-website'),
//   getRepoContributions('create-abell-app'),
//   getRepoContributions('abell-renderer'),
//   getRepoContributions('official-plugins')
// ]).then((resp) => resp.flat());

// fs.writeFileSync(
//   './archivedContributors.json',
//   JSON.stringify(archivedRepoContributions)
// );

export const makeRoutes = (): Route[] => {
  return [
    {
      path: '/',
      render: () => index({ sponsors, contributors })
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
