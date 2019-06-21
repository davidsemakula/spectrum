// @flow
import type { DBCommunitySettings } from 'shared/types';
import type { GraphQLContext } from '../../';

export default async (
  { hubspotSettings }: DBCommunitySettings,
  _: any,
  { loaders }: GraphQLContext
) => {
  return hubspotSettings ? (hubspotSettings.connectedAt ? true : false) : false;
};
