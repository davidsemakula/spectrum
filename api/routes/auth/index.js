// @flow
import { Router } from 'express';
import twitterAuthRoutes from './twitter';
import facebookAuthRoutes from './facebook';
import googleAuthRoutes from './google';
import githubAuthRoutes from './github';
import slackAuthRoutes from './slack';
import externalAuthRoutes from './external';
import logoutRoutes from './logout';

const authRouter = Router();

authRouter.use('/twitter', twitterAuthRoutes);
authRouter.use('/facebook', facebookAuthRoutes);
authRouter.use('/google', googleAuthRoutes);
authRouter.use('/github', githubAuthRoutes);
authRouter.use('/slack', slackAuthRoutes);
authRouter.use('/external', externalAuthRoutes);
authRouter.use('/logout', logoutRoutes);

export default authRouter;
