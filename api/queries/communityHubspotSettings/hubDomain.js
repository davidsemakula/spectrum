// @flow
import type { DBCommunitySettings } from 'shared/types';
import type { GraphQLContext } from '../../';
import { decryptString } from 'shared/encryption';

export default async (
  { hubspotSettings }: DBCommunitySettings,
  _: any,
  { loaders }: GraphQLContext
) => {
  return hubspotSettings && hubspotSettings.hubDomain
    ? decryptString(hubspotSettings.hubDomain)
    : null;
};
