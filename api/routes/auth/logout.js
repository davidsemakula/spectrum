import { Router } from 'express';
const debug = require('debug')('api:routes:auth:logout');
import { destroySession } from '../../models/session';
import { processActivitySyncEventQueue } from 'shared/bull/queues';

const IS_PROD = process.env.NODE_ENV === 'production';
const HOME = IS_PROD ? '/' : 'http://localhost:3000/';
const logoutRouter = Router();

logoutRouter.get('/', (req, res) => {
  const userId = req.user.id;
  req.logout();

  if (userId) {
    processActivitySyncEventQueue.add({
      userId: userId,
      type: 'logged out',
      entityId: userId,
    });
  }

  return res.redirect(HOME);
});

export default logoutRouter;
