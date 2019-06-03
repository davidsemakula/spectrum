// @flow
import type { DBCommunitySettings } from 'shared/types';
import type { GraphQLContext } from '../../';

export default async (
  { hubSpotSettings }: DBCommunitySettings,
  _: any,
  { loaders }: GraphQLContext
) => {
  return hubSpotSettings ? (hubSpotSettings.connectedAt ? true : false) : false;
};
