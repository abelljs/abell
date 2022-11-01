import { Route } from 'abell';
import index from './index.abell';
import docs from './docs.abell';

export const makeRoutes = (): Route[] => {
  return [
    {
      path: '/',
      render: index
    },
    {
      path: '/getting-started',
      render: docs
    }
  ];
};
