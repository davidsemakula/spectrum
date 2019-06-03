// @flow
import * as React from 'react';
import type { GetHubSpotSettingsType } from 'shared/graphql/queries/community/getCommunityHubSpotSettings';
import {
  SectionCard,
  SectionTitleWithIcon,
  SectionSubtitle,
  SectionCardFooter,
} from 'src/components/settingsViews/style';
import { OutlineButton } from 'src/components/button';
import Icon from 'src/components/icon';

type Props = {
  community: GetHubSpotSettingsType,
  isOnboarding: boolean,
};

class ImportSlackTeam extends React.Component<Props> {
  render() {
    const { community, isOnboarding = false } = this.props,
      { hubSpotSettings } = community;

    const url = `/api/hubspot/connect?community=${community.id}&${
      isOnboarding ? 'onboarding=1' : ''
    }`;

    return (
      <SectionCard>
        <SectionTitleWithIcon>
          {/*<Icon glyph={'hubspot-colored'} size={32} />*/}
          Connect{hubSpotSettings && hubSpotSettings.isConnected ? 'ed' : ''} to
          a HubSpot portal
        </SectionTitleWithIcon>
        <SectionSubtitle>
          Share activity from your learning group with your HubSpot portal.
        </SectionSubtitle>

        {hubSpotSettings && hubSpotSettings.hubId ? (
          <SectionSubtitle>
            Connected HubSpot Portal ID: {hubSpotSettings.hubId}
          </SectionSubtitle>
        ) : null}

        <SectionCardFooter>
          <a href={url}>
            <OutlineButton>
              {hubSpotSettings && hubSpotSettings.isConnected ? 'Re-c' : 'C'}
              onnect a HubSpot portal
            </OutlineButton>
          </a>
        </SectionCardFooter>
      </SectionCard>
    );
  }
}

export default ImportSlackTeam;
