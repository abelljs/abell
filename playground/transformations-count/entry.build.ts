/// <reference types="abell/types" />

import { Route } from 'abell';
import index from './index.abell';
import about from './about.abell';
import { date } from './something.js';

export const makeRoutes = (): Route[] => {
  return [
    {
      path: '/',
      render: index
    },
    {
      path: '/about-1',
      render: () => about({ date })
    },
    {
      path: '/about-2',
      render: () => about({ date })
    }
  ];
};
