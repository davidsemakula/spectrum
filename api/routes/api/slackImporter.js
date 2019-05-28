// @flow
import { Router } from 'express';
import UserError from '../../utils/UserError';
import { generateOAuthToken } from '../../models/slackImport';
import { updateSlackSettingsAfterConnection } from '../../models/communitySettings';
import { encryptString } from 'shared/encryption';

import DOMAIN from 'shared/site-domain';

const IS_PROD = process.env.NODE_ENV === 'production';

const slackRouter = Router();

const constructInput = (data: any, connectedBy: string) => {
  const token = encryptString(data.access_token);
  const teamName = encryptString(data.team_name);
  const teamId = encryptString(data.team_id);
  const scope = encryptString(data.scope);

  return {
    token,
    teamName,
    teamId,
    connectedBy,
    scope,
  };
};

// TODO: Figure out how to type this properly
slackRouter.get('/', (req: any, res: any) => {
  const code = req.query.code;
  const communityId = req.query.state;
  const connectedBy = req.user.id;
  const returnURI = IS_PROD
    ? 'https://learn.keyy.org/api/slack'
    : 'http://localhost:3001/api/slack';

  // generate an oauth token. This token will be used to communicate with the Slack API to get user information, and we'll store the token in the db record to allow for the user to access their Slack team info in the future.
  return generateOAuthToken(code, returnURI)
    .then(data => {
      if (!data) return new UserError('No token generated for this Slack team');
      const input = constructInput(data, connectedBy);
      return updateSlackSettingsAfterConnection(
        communityId,
        input,
        connectedBy
      );
    })
    .then(community => community.slug)
    .then(slug => {
      return IS_PROD
        ? res.redirect(`https://${DOMAIN}/${slug}/settings`)
        : res.redirect(`http://localhost:3000/${slug}/settings`);
    });
});

slackRouter.get('/connect', (req: any, res: any) => {
  const isOnboarding = !!req.query.onboarding;
  const communityId = req.query.community;
  const urlBase =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : `https://${DOMAIN}`;
  const url = `https://slack.com/oauth/authorize?client_id=${
    process.env.SLACK_CLIENT_ID
  }&scope=users:read.email%20users:read%20chat:write:bot%20groups:read%20channels:read&state=${communityId}&redirect_uri=${urlBase}/api/slack${
    isOnboarding ? '/onboarding' : ''
  }`;
  return res.redirect(url);
});

// TODO: Figure out how to type this properly
slackRouter.get('/onboarding', (req: any, res: any) => {
  const code = req.query.code;
  const communityId = req.query.state;
  const connectedBy = req.user.id;
  const returnURI = IS_PROD
    ? 'https://learn.keyy.org/api/slack/onboarding'
    : 'http://localhost:3001/api/slack/onboarding';

  // generate an oauth token. This token will be used to communicate with the Slack API to get user information, and we'll store the token in the db record to allow for the user to access their Slack team info in the future.
  return generateOAuthToken(code, returnURI)
    .then(data => {
      if (!data) return new UserError('No token generated for this Slack team');
      const input = constructInput(data, connectedBy);
      return updateSlackSettingsAfterConnection(
        communityId,
        input,
        connectedBy
      );
    })
    .then(community => community.id)
    .then(id => {
      return IS_PROD
        ? res.redirect(`https://${DOMAIN}/new/community?s=2&id=${id}`)
        : res.redirect(`http://localhost:3000/new/community?s=2&id=${id}`);
    });
});

export default slackRouter;
