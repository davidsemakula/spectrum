// @flow
import { Router } from 'express';
import { createSigninRoutes } from './create-signin-routes';
import uuidv4 from 'uuid/v4';
import Raven from 'shared/raven';
const {
  storeUser,
  getUserByUsername,
  getUserById,
  getUsersByEmail,
  saveUserProvider,
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
    if (!user.email) {
      return res.status(400).json({
        error: 'New user should have email address',
      });
    }
    if (user.externalProviderId || user.id) {
      return res.status(400).json({
        error: "New user can't have prefilled id",
      });
    }
    (user.username ? getUserByUsername(user.username) : Promise.resolve())
      .then(resp => {
        let conflictingUsername = !!resp;
        if (conflictingUsername) {
          user.username += '-' + uuidv4().slice(0, 8);
        }
        return getUsersByEmail(user.email).then(dbUsers => {
          dbUsers = dbUsers || [];
          if (dbUsers.length) {
            dbUsers.sort((a, b) => {
              (a.createdAt || '').localeCompare(b.createdAt || '');
            });
            if (conflictingUsername) {
              delete user.username;
            }
            user.modifiedAt = new Date().toISOString();
            return saveUserProvider(
              dbUsers[0].id,
              'externalProviderId',
              dbUsers[0].externalProviderId,
              user
            );
          } else {
            user.externalProviderId = uuidv4();
            return storeUser(user);
          }
        });
      })
      .then(dbUser => {
        return res.json(dbUser);
      })
      .catch(e => {
        res.status(500).json({
          error: 'Failed to create or update user',
          detail: e.message || e.toString(),
        });
        Raven.captureException(e);
      });
  }
);

externalAuthRouter.post('/', ...callbacks);

export default externalAuthRouter;
