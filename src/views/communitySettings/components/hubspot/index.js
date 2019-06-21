// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import getHubspotSettings, {
  type GetHubspotSettingsType,
} from 'shared/graphql/queries/community/getCommunityHubspotSettings';
import viewNetworkHandler, {
  type ViewNetworkHandlerType,
} from 'src/components/viewNetworkHandler';
import { Loading } from 'src/components/loading';
import { SectionCard } from 'src/components/settingsViews/style';
import ViewError from 'src/components/viewError';
import ConnectHubSpot from './connectHubspot';

type Props = {
  ...$Exact<ViewNetworkHandlerType>,
  data: {
    community: GetHubspotSettingsType,
  },
  type: 'import-only' | 'bot-only',
  isOnboarding: boolean,
  channelFilter?: string,
};

export class HubSpot extends React.Component<Props> {
  render() {
    const { isLoading, hasError, data, isOnboarding } = this.props;

    if (
      data.community &&
      (data.community.communityPermissions.isOwner ||
        data.community.communityPermissions.isModerator)
    ) {
      return (
        <React.Fragment>
          <ConnectHubSpot
            community={data.community}
            isOnboarding={isOnboarding}
          />
        </React.Fragment>
      );
    }

    if (isLoading) {
      return (
        <SectionCard>
          <Loading />
        </SectionCard>
      );
    }

    if (hasError) {
      return (
        <SectionCard>
          <ViewError />
        </SectionCard>
      );
    }

    return null;
  }
}

export default compose(
  connect(),
  getHubspotSettings,
  viewNetworkHandler
)(HubSpot);
