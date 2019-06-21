// @flow
import { Router } from 'express';
import { encryptString } from 'shared/encryption';
import axios from 'axios';
const querystring = require('querystring');

import DOMAIN from 'shared/site-domain';
import { updateHubspotSettingsAfterConnection } from '../../models/communitySettings';
import UserError from '../../utils/UserError';

const IS_PROD = process.env.NODE_ENV === 'production';

let HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET || '';
let HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID || '';

type HubSpotData = {
  access_token: string,
  refresh_token: string,
  hub_id: string,
  app_id: string,
  user_id: string,
  hub_domain: string,
  email: string,
  scope: string,
};

// prettier-ignore
export const generateOAuthToken = (code: string, redirect_uri: string): Promise<?HubSpotData> => {
  return axios
    .post(
      'https://api.hubapi.com/oauth/v1/token',
      querystring.stringify({
        code: code,
        grant_type: "authorization_code",
        client_id: HUBSPOT_CLIENT_ID,
        client_secret: HUBSPOT_CLIENT_SECRET,
        redirect_uri,
      })
    )
    .then(response => {
      // if the response is valid
      const token = response.data;
      if (token) {
        return axios.get(`https://api.hubapi.com/oauth/v1/access-tokens/${token.access_token}`, {
          headers: {
            'Accept': 'application/json'
          }
        }).then(function (response2) {
          const tokenInfo = response2.data || {};

          return {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            hub_id: tokenInfo.hub_id || '',
            app_id: tokenInfo.app_id || '',
            user_id: tokenInfo.user_id || '',
            hub_domain: tokenInfo.hub_domain || '',
            email: tokenInfo.user || '',
            scope: (tokenInfo.scopes || []).join(' '),
          };
        }).catch(function (error) {
          console.error('\n\nerror', error);
          return null;
        });
      }
    })
    .catch(error => {
      console.error('\n\nerror', error);
      return null;
    });
};

const hubSpotRouter = Router();

const constructInput = (data: any, connectedBy: string) => {
  const accessToken = encryptString(data.access_token);
  const refreshToken = encryptString(data.refresh_token);
  const hubId = encryptString(data.hub_id);
  const appId = encryptString(data.app_id);
  const userId = encryptString(data.user_id);
  const hubDomain = encryptString(data.hub_domain);
  const email = encryptString(data.email);
  const scope = encryptString(data.scope);

  return {
    accessToken,
    refreshToken,
    hubId,
    appId,
    userId,
    hubDomain,
    email,
    connectedBy,
    scope,
  };
};

// TODO: Figure out how to type this properly
hubSpotRouter.get('/', (req: any, res: any) => {
  const code = req.query.code;
  const communityId = req.query.state;
  const connectedBy = req.user.id;
  const returnURI = IS_PROD
    ? 'https://learn.keyy.org/api/hubspot'
    : 'http://localhost:3001/api/hubspot';

  // generate an oauth token. This token will be used to communicate with the HubSpot API to get user information, and we'll store the token in the db record to allow for the user to access their Slack team info in the future.
  return generateOAuthToken(code, returnURI)
    .then(data => {
      if (!data)
        return new UserError('No token generated for this HubSpot portal');
      const input = constructInput(data, connectedBy);
      return updateHubspotSettingsAfterConnection(
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

hubSpotRouter.get('/connect', (req: any, res: any) => {
  const isOnboarding = !!req.query.onboarding;
  const communityId = req.query.community;
  const urlBase =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : `https://${DOMAIN}`;
  const url = `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}&scope=${encodeURIComponent(
    ['oauth', 'timeline', 'contacts'].join(' ')
  )}&state=${communityId}&redirect_uri=${urlBase}/api/hubspot${
    isOnboarding ? '/onboarding' : ''
  }`;
  return res.redirect(url);
});

export default hubSpotRouter;
