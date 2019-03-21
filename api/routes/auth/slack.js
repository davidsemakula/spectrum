// @flow
import { Router } from 'express';
import { createSigninRoutes } from './create-signin-routes';

const slackAuthRouter = Router();
const { main, callbacks } = createSigninRoutes('slack');

slackAuthRouter.get('/', main);

slackAuthRouter.get('/callback', ...callbacks);

export default slackAuthRouter;
