// @flow
import type { DBCommunitySettings } from 'shared/types';
import type { GraphQLContext } from '../../';
import { decryptString } from 'shared/encryption';

export default async (
  { hubSpotSettings }: DBCommunitySettings,
  _: any,
  { loaders }: GraphQLContext
) => {
  return hubSpotSettings && hubSpotSettings.hubId
    ? decryptString(hubSpotSettings.hubId)
    : null;
};
