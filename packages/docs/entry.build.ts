import { Route } from 'abell';
import path from 'path';
import { fetchBuilder, FileSystemCache } from 'node-fetch-cache';

// Layouts
import index from './index.abell';
import webcontainer from './webcontainer.abell';
import docs from './docs.abell';

// Content
// import whyAbellContent from './content/why-abell.mdx';
import gettingStartedContent from './content/getting-started.mdx';
import syntaxGuide from './content/syntax-guide.mdx';
import customRouting from './content/custom-routing.mdx';
// import pluginsAndIntegration from './content/plugins-and-integration.mdx';

// Docs Routes
const docsPaths = [
  // {
  //   path: '/why-abell',
  //   title: 'Why Abell',
  //   content: whyAbellContent
  // },
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
  }
  // {
  //   path: '/plugins-and-integrations',
  //   title: 'Plugins & Integrations',
  //   content: pluginsAndIntegration
  // }
];

const MINUTE = 60 * 1000;

const fetchWithCache = fetchBuilder.withCache(
  new FileSystemCache({
    ttl: 15 * MINUTE,
    cacheDirectory: path.resolve('./.cache')
  })
);

const sponsorsData = await fetchWithCache(
  'https://ghs.vercel.app/v2/sponsors/saurabhdaware'
).then((res) => res.json());

// Current and past are swapped - https://github.com/filiptronicek/gh-sponsors-api/issues/27
const sponsors = sponsorsData.sponsors.past;

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
