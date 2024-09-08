import { Express, Router } from 'express';

import filterExceptionMiddleware from '../shared/middlewares/filter-exception.middleware';
import loggerMiddleware from '../shared/middlewares/logger.middleware';
import notFoundMiddleware from '../shared/middlewares/not-found.middleware';

import auth from './auth.r';
import pet from './pet.r';
import quest from './quest.r';
import users from './users.r';

const initRoutes = (app: Express) => {
  app.use(loggerMiddleware);

  const v1Router = Router();

  v1Router.use('/auth', auth);
  v1Router.use('/users', users);
  v1Router.use('/pet', pet);
  v1Router.use('/quest', quest);

  app.use('/api/v1', v1Router);
  app.use('*', notFoundMiddleware);
  app.use(filterExceptionMiddleware);
};

export default initRoutes;
