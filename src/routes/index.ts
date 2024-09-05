import { Express } from 'express';

import authorizationMiddleware from '../shared/middlewares/authorization.middleware';
import filterExceptionMiddleware from '../shared/middlewares/filter-exception.middleware';
import loggerMiddleware from '../shared/middlewares/logger.middleware';
import notFoundMiddleware from '../shared/middlewares/not-found.middleware';

import auth from './auth.r';
import users from './users.r';

const initRoutes = (app: Express) => {
  app.use(loggerMiddleware);
  app.use(authorizationMiddleware);
  app.use('/auth', auth);
  app.use('/users', users);
  app.use('*', notFoundMiddleware);
  app.use(filterExceptionMiddleware);
};

export default initRoutes;
