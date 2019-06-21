// @flow
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import communityInfoFragment from '../../fragments/community/communityInfo';
import type { CommunityInfoType } from '../../fragments/community/communityInfo';

export type GetHubspotSettingsType = {
  ...$Exact<CommunityInfoType>,
  hubspotSettings: {
    hubId: string,
    hubDomain: string,
    isConnected: boolean,
  },
};

export const getHubspotSettingsQuery = gql`
  query getHubspotSettings($id: ID!) {
    community(id: $id) {
      ...communityInfo
      hubspotSettings {
        hubId
        hubDomain
        isConnected
      }
    }
  }
  ${communityInfoFragment}
`;

const getHubspotSettingsOptions = {
  options: ({ id }) => ({
    variables: {
      id,
    },
  }),
};

export default graphql(getHubspotSettingsQuery, getHubspotSettingsOptions);
