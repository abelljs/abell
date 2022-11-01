import { Route } from 'abell';
import index from './index.abell';

export const makeRoutes = (): Route[] => {
  return [
    {
      path: '/',
      render: index
    }
  ];
};
