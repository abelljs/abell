/// <reference types="abell/types" />

import { Route } from 'abell';
import index from './index.abell';
import about from './about.abell';

export const makeRoutes = (): Route[] => {
  return [
    {
      path: '/',
      render: index
    },
    {
      path: '/about',
      render: about,
      routeOptions: {
        outputPathPattern: '[route]/index.html'
      }
    }
  ];
};
