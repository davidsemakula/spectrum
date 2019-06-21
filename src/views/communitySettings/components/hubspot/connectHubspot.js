// @flow
import * as React from 'react';
import type { GetHubspotSettingsType } from 'shared/graphql/queries/community/getCommunityHubspotSettings';
import {
  SectionCard,
  SectionTitleWithIcon,
  SectionSubtitle,
  SectionCardFooter,
} from 'src/components/settingsViews/style';
import { OutlineButton } from 'src/components/button';
import Icon from 'src/components/icon';

type Props = {
  community: GetHubspotSettingsType,
  isOnboarding: boolean,
};

class ConnectHubspotPortal extends React.Component<Props> {
  render() {
    const { community, isOnboarding = false } = this.props,
      { hubspotSettings } = community;

    const url = `/api/hubspot/connect?community=${community.id}&${
      isOnboarding ? 'onboarding=1' : ''
    }`;

    return (
      <SectionCard>
        <SectionTitleWithIcon>
          {/*<Icon glyph={'hubspot-colored'} size={32} />*/}
          Connect{hubspotSettings && hubspotSettings.isConnected ? 'ed' : ''} to
          a HubSpot portal
        </SectionTitleWithIcon>

        <SectionSubtitle>
          {hubspotSettings && hubspotSettings.isConnected
            ? 'Activity from your learning group is being shared'
            : 'Share activity from your learning group'}{' '}
          with your HubSpot portal.
        </SectionSubtitle>

        {hubspotSettings && hubspotSettings.hubId ? (
          <SectionSubtitle>Portal ID: {hubspotSettings.hubId}</SectionSubtitle>
        ) : null}

        {hubspotSettings && hubspotSettings.hubDomain ? (
          <SectionSubtitle>
            Portal Domain: {hubspotSettings.hubDomain}
          </SectionSubtitle>
        ) : null}

        <SectionCardFooter>
          <a href={url}>
            <OutlineButton>
              {hubspotSettings && hubspotSettings.isConnected ? 'Re-c' : 'C'}
              onnect a HubSpot portal
            </OutlineButton>
          </a>
        </SectionCardFooter>
      </SectionCard>
    );
  }
}

export default ConnectHubspotPortal;
