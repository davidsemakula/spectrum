// @flow
import { Router } from 'express';
import { createSigninRoutes } from './create-signin-routes';
import uuidv4 from 'uuid/v4';
import Raven from 'shared/raven';
const {
  storeUser,
  getUserByUsername,
  getUserById,
} = require('shared/db/queries/user');

const externalAuthRouter = Router();
const { main, callbacks } = createSigninRoutes('jwt');

const ADMIN_TOKEN = process.env.EXTERNAL_AUTH_ADMIN_TOKEN;

externalAuthRouter.post(
  '/create',
  require('express-bearer-token')(),
  (req: express$Request, res: express$Response, next) => {
    if (!ADMIN_TOKEN || req.token !== ADMIN_TOKEN) {
      return res.status(403).json({
        error: 'Invalid bearer token',
      });
    }
    req.body = req.body || {};
    const user = req.body.user;
    if (!user) {
      return res.status(400).json({
        error: 'No user in body',
      });
    }
    if (user.externalProviderId) {
      return res.status(400).json({
        error: "New user can't have prefilled externalProviderId",
      });
    }
    user.externalProviderId = uuidv4();
    (user.username ? getUserByUsername(user.username) : Promise.resolve())
      .then(resp => {
        if (resp) {
          user.username += '-' + user.externalProviderId.slice(0, 12);
        }
        return storeUser(user);
      })
      .then(dbUser => {
        return res.json(dbUser);
      })
      .catch(e => {
        res.status(500).json({
          error: 'Failed to create user',
          detail: e.message || e.toString(),
        });
        Raven.captureException(e);
      });
  }
);

externalAuthRouter.get('/', ...callbacks);

export default externalAuthRouter;
