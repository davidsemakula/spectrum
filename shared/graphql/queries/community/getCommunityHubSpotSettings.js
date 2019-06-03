// @flow
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import communityInfoFragment from '../../fragments/community/communityInfo';
import type { CommunityInfoType } from '../../fragments/community/communityInfo';

export type GetHubSpotSettingsType = {
  ...$Exact<CommunityInfoType>,
  hubSpotSettings: {
    hubId: string,
    isConnected: boolean,
  },
};

export const getHubSpotSettingsQuery = gql`
  query getHubSpotSettings($id: ID!) {
    community(id: $id) {
      ...communityInfo
      hubSpotSettings {
        hubId
        isConnected
      }
    }
  }
  ${communityInfoFragment}
`;

const getHubSpotSettingsOptions = {
  options: ({ id }) => ({
    variables: {
      id,
    },
  }),
};

export default graphql(getHubSpotSettingsQuery, getHubSpotSettingsOptions);
